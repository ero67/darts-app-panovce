import { supabase, generateId } from '../lib/supabase.js';

export const leagueService = {
  // Create a new league
  async createLeague(leagueData) {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError) throw userError;
      if (!user) throw new Error('User must be authenticated to create leagues');

      const leagueId = leagueData.id || generateId();

      const { data: league, error: leagueError } = await supabase
        .from('leagues')
        .insert({
          id: leagueId,
          name: leagueData.name,
          description: leagueData.description || null,
          status: leagueData.status || 'active',
          manager_ids: leagueData.managerIds || [user.id],
          created_by: user.id,
          default_tournament_settings: leagueData.defaultTournamentSettings || null,
          scoring_rules: leagueData.scoringRules || {
            placementPoints: { "1": 12, "2": 9, "3": 7, "4": 5, "5": 3, "default": 1 },
            allowManualOverride: true
          }
        })
        .select()
        .single();

      if (leagueError) throw leagueError;

      // Add initial members if provided
      if (leagueData.players && leagueData.players.length > 0) {
        await this.addMembers(leagueId, leagueData.players);
      }

      return this.transformLeague(league);
    } catch (error) {
      console.error('Error creating league:', error);
      throw error;
    }
  },

  // Get all leagues
  async getLeagues() {
    try {
      const { data: leagues, error } = await supabase
        .from('leagues')
        .select('*')
        .eq('deleted', false)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Get member counts and tournament counts for each league
      const leaguesWithStats = await Promise.all(
        leagues.map(async (league) => {
          const [memberCount, tournamentCount] = await Promise.all([
            this.getMemberCount(league.id),
            this.getTournamentCount(league.id)
          ]);

          return {
            ...this.transformLeague(league),
            memberCount,
            tournamentCount
          };
        })
      );

      return leaguesWithStats;
    } catch (error) {
      console.error('Error fetching leagues:', error);
      throw error;
    }
  },

  // Get a single league with full details
  async getLeague(leagueId) {
    try {
      const { data: league, error } = await supabase
        .from('leagues')
        .select('*')
        .eq('id', leagueId)
        .eq('deleted', false)
        .single();

      if (error) throw error;
      if (!league) throw new Error('League not found');

      // Get members
      const members = await this.getMembers(leagueId);

      // Get tournaments
      const { data: tournaments, error: tournamentsError } = await supabase
        .from('tournaments')
        .select('id, name, status, created_at, updated_at')
        .eq('league_id', leagueId)
        .eq('deleted', false)
        .order('created_at', { ascending: false });

      if (tournamentsError) {
        console.error('Error fetching league tournaments:', tournamentsError);
      }

      // Get leaderboard
      const leaderboard = await this.getLeaderboard(leagueId);

      return {
        ...this.transformLeague(league),
        members,
        tournaments: tournaments || [],
        leaderboard
      };
    } catch (error) {
      console.error('Error fetching league:', error);
      throw error;
    }
  },

  // Update league
  async updateLeague(leagueId, updates) {
    try {
      const { data, error } = await supabase
        .from('leagues')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', leagueId)
        .select()
        .single();

      if (error) throw error;
      return this.transformLeague(data);
    } catch (error) {
      console.error('Error updating league:', error);
      throw error;
    }
  },

  // Delete league (soft delete)
  async deleteLeague(leagueId) {
    try {
      const { data, error } = await supabase
        .from('leagues')
        .update({
          deleted: true,
          updated_at: new Date().toISOString()
        })
        .eq('id', leagueId)
        .select()
        .single();

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error deleting league:', error);
      throw error;
    }
  },

  // Add members to league
  async addMembers(leagueId, players) {
    try {
      // players can be array of player IDs or array of player objects with id
      const playerIds = players.map(p => typeof p === 'string' ? p : p.id);

      // Check if players exist, create if needed
      const membersToAdd = [];
      for (const player of players) {
        let playerId;
        if (typeof player === 'string') {
          playerId = player;
        } else if (player.id) {
          playerId = player.id;
        } else if (player.name) {
          // Create new player
          const { data: existingPlayer } = await supabase
            .from('players')
            .select('id')
            .eq('name', player.name)
            .maybeSingle();

          if (existingPlayer) {
            playerId = existingPlayer.id;
          } else {
            playerId = generateId();
            const { error: playerError } = await supabase
              .from('players')
              .insert({
                id: playerId,
                name: player.name
              });

            if (playerError) throw playerError;
          }
        } else {
          continue; // Skip invalid player data
        }

        membersToAdd.push({
          league_id: leagueId,
          player_id: playerId,
          role: player.role || 'player',
          is_active: player.isActive !== undefined ? player.isActive : true
        });
      }

      if (membersToAdd.length === 0) return [];

      const { data, error } = await supabase
        .from('league_members')
        .upsert(membersToAdd, {
          onConflict: 'league_id,player_id',
          ignoreDuplicates: false
        })
        .select(`
          *,
          player:players(*)
        `);

      if (error) throw error;
      return data.map(m => ({
        id: m.id,
        leagueId: m.league_id,
        player: m.player,
        role: m.role,
        isActive: m.is_active,
        joinedAt: m.joined_at
      }));
    } catch (error) {
      console.error('Error adding league members:', error);
      throw error;
    }
  },

  // Get league members
  async getMembers(leagueId) {
    try {
      const { data, error } = await supabase
        .from('league_members')
        .select(`
          *,
          player:players(*)
        `)
        .eq('league_id', leagueId)
        .is('left_at', null)
        .order('joined_at', { ascending: true });

      if (error) throw error;

      return data.map(m => ({
        id: m.id,
        leagueId: m.league_id,
        player: m.player,
        role: m.role,
        isActive: m.is_active,
        joinedAt: m.joined_at
      }));
    } catch (error) {
      console.error('Error fetching league members:', error);
      throw error;
    }
  },

  // Update member status
  async updateMemberStatus(leagueId, playerId, updates) {
    try {
      const updateData = {
        updated_at: new Date().toISOString()
      };

      if (updates.isActive !== undefined) {
        updateData.is_active = updates.isActive;
      }
      if (updates.role !== undefined) {
        updateData.role = updates.role;
      }
      if (updates.leftAt !== undefined) {
        updateData.left_at = updates.leftAt ? new Date().toISOString() : null;
      }

      const { data, error } = await supabase
        .from('league_members')
        .update(updateData)
        .eq('league_id', leagueId)
        .eq('player_id', playerId)
        .select(`
          *,
          player:players(*)
        `)
        .single();

      if (error) throw error;

      return {
        id: data.id,
        leagueId: data.league_id,
        player: data.player,
        role: data.role,
        isActive: data.is_active,
        joinedAt: data.joined_at
      };
    } catch (error) {
      console.error('Error updating member status:', error);
      throw error;
    }
  },

  // Remove member from league
  async removeMember(leagueId, playerId) {
    try {
      const { error } = await supabase
        .from('league_members')
        .update({
          left_at: new Date().toISOString(),
          is_active: false
        })
        .eq('league_id', leagueId)
        .eq('player_id', playerId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error removing league member:', error);
      throw error;
    }
  },

  // Get member count
  async getMemberCount(leagueId) {
    try {
      const { count, error } = await supabase
        .from('league_members')
        .select('*', { count: 'exact', head: true })
        .eq('league_id', leagueId)
        .is('left_at', null);

      if (error) throw error;
      return count || 0;
    } catch (error) {
      console.error('Error getting member count:', error);
      return 0;
    }
  },

  // Get tournament count
  async getTournamentCount(leagueId) {
    try {
      const { count, error } = await supabase
        .from('tournaments')
        .select('*', { count: 'exact', head: true })
        .eq('league_id', leagueId)
        .eq('deleted', false);

      if (error) throw error;
      return count || 0;
    } catch (error) {
      console.error('Error getting tournament count:', error);
      return 0;
    }
  },

  // Get leaderboard
  async getLeaderboard(leagueId) {
    try {
      const { data, error } = await supabase
        .from('league_leaderboard')
        .select(`
          *,
          player:players(*)
        `)
        .eq('league_id', leagueId)
        .order('total_points', { ascending: false })
        .order('avg_placement', { ascending: true });

      if (error) throw error;

      return (data || []).map(l => ({
        player: l.player,
        totalPoints: l.total_points || 0,
        tournamentsPlayed: l.tournaments_played || 0,
        bestPlacement: l.best_placement,
        worstPlacement: l.worst_placement,
        avgPlacement: l.avg_placement ? parseFloat(l.avg_placement) : null,
        lastTournamentAt: l.last_tournament_at
      }));
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
      return [];
    }
  },

  // Record tournament results and calculate points
  async recordTournamentResults(leagueId, tournamentId) {
    try {
      // Get tournament data
      const { data: tournament, error: tournamentError } = await supabase
        .from('tournaments')
        .select('*')
        .eq('id', tournamentId)
        .eq('league_id', leagueId)
        .single();

      if (tournamentError) throw tournamentError;
      if (!tournament) throw new Error('Tournament not found or not part of this league');

      // Check if already calculated
      if (tournament.league_points_calculated) {
        console.log('Tournament results already calculated');
        return;
      }

      // Get tournament with full data (groups, standings, playoffs)
      // We'll need to use tournamentService.getTournament for this
      // For now, we'll calculate placements from the tournament data structure
      // This should be called after tournament completion

      // Get league scoring rules
      const { data: league } = await supabase
        .from('leagues')
        .select('scoring_rules')
        .eq('id', leagueId)
        .single();

      if (!league) throw new Error('League not found');

      const scoringRules = league.scoring_rules || {
        placementPoints: { "1": 12, "2": 9, "3": 7, "4": 5, "5": 3, "default": 1 },
        allowManualOverride: true
      };

      // This function will be called from tournament completion handler
      // For now, return a placeholder
      return { message: 'Results calculation will be implemented in tournament completion flow' };
    } catch (error) {
      console.error('Error recording tournament results:', error);
      throw error;
    }
  },

  // Calculate placements from tournament data and award points
  async calculateTournamentPlacements(leagueId, tournamentId, tournamentData) {
    try {
      const placements = [];

      // Determine placements based on tournament structure
      if (tournamentData.playoffs && tournamentData.playoffs.rounds && tournamentData.playoffs.rounds.length > 0) {
        // Tournament has playoffs - use playoff results
        const finalRound = tournamentData.playoffs.rounds[tournamentData.playoffs.rounds.length - 1];
        const finalMatch = finalRound.matches.find(m => !m.isThirdPlaceMatch && m.status === 'completed');
        const thirdPlaceMatch = finalRound.matches.find(m => m.isThirdPlaceMatch && m.status === 'completed');

        // Get all playoff participants and their final positions
        const playoffPlayers = new Set();
        tournamentData.playoffs.rounds.forEach(round => {
          round.matches.forEach(match => {
            if (match.player1) playoffPlayers.add(match.player1.id);
            if (match.player2) playoffPlayers.add(match.player2.id);
          });
        });

        // Assign placements
        if (finalMatch && finalMatch.result) {
          placements.push({
            playerId: finalMatch.result.winner,
            placement: 1
          });
          const loserId = finalMatch.result.winner === finalMatch.player1?.id 
            ? finalMatch.player2?.id 
            : finalMatch.player1?.id;
          if (loserId) {
            placements.push({
              playerId: loserId,
              placement: 2
            });
          }
        }

        if (thirdPlaceMatch && thirdPlaceMatch.result) {
          placements.push({
            playerId: thirdPlaceMatch.result.winner,
            placement: 3
          });
        }

        // For other players, rank by round eliminated (simplified - would need more logic for full bracket)
        // For MVP, we'll assign default placement for non-top-3
        const placedPlayerIds = new Set(placements.map(p => p.playerId));
        let currentPlacement = 4;
        tournamentData.playoffs.rounds.forEach((round, roundIndex) => {
          round.matches.forEach(match => {
            if (match.status === 'completed' && match.result) {
              const loserId = match.result.winner === match.player1?.id 
                ? match.player2?.id 
                : match.player1?.id;
              if (loserId && !placedPlayerIds.has(loserId)) {
                placements.push({
                  playerId: loserId,
                  placement: currentPlacement++
                });
                placedPlayerIds.add(loserId);
              }
            }
          });
        });
      } else {
        // Group-only tournament - use group standings
        const allStandings = [];
        tournamentData.groups.forEach(group => {
          if (group.standings && group.standings.length > 0) {
            group.standings.forEach((standing, index) => {
              allStandings.push({
                playerId: standing.player.id,
                groupName: group.name,
                position: index + 1,
                points: standing.points,
                legDifference: standing.legsWon - standing.legsLost,
                average: standing.average
              });
            });
          }
        });

        // Sort all players across groups by performance
        allStandings.sort((a, b) => {
          if (b.points !== a.points) return b.points - a.points;
          if (b.legDifference !== a.legDifference) return b.legDifference - a.legDifference;
          if (b.average !== a.average) return b.average - a.average;
          return 0;
        });

        // Assign placements
        allStandings.forEach((standing, index) => {
          placements.push({
            playerId: standing.playerId,
            placement: index + 1
          });
        });
      }

      // Get league scoring rules
      const { data: league } = await supabase
        .from('leagues')
        .select('scoring_rules')
        .eq('id', leagueId)
        .single();

      if (!league) throw new Error('League not found');

      const scoringRules = league.scoring_rules || {
        placementPoints: { "1": 12, "2": 9, "3": 7, "4": 5, "5": 3, "default": 1 },
        allowManualOverride: true
      };

      const placementPoints = scoringRules.placementPoints || { "1": 12, "2": 9, "3": 7, "4": 5, "5": 3, "default": 1 };

      // Award points and create results records
      const resultsToInsert = placements.map(p => {
        const points = placementPoints[p.placement.toString()] || placementPoints.default || 1;
        return {
          league_id: leagueId,
          tournament_id: tournamentId,
          player_id: p.playerId,
          placement: p.placement,
          points_awarded: points
        };
      });

      // Upsert results (in case of recalculation)
      if (resultsToInsert.length > 0) {
        const { error: insertError } = await supabase
          .from('league_tournament_results')
          .upsert(resultsToInsert, {
            onConflict: 'league_id,tournament_id,player_id'
          });

        if (insertError) throw insertError;
      }

      // Mark tournament as calculated
      await supabase
        .from('tournaments')
        .update({ league_points_calculated: true })
        .eq('id', tournamentId);

      return resultsToInsert;
    } catch (error) {
      console.error('Error calculating tournament placements:', error);
      throw error;
    }
  },

  // Recalculate all tournament results for a league (without updating leaderboard cache to avoid loops)
  async recalculateAllResults(leagueId) {
    try {
      // Import tournamentService dynamically to avoid circular dependency
      const { tournamentService } = await import('./tournamentService.js');
      
      // Get all completed tournaments for this league
      const { data: tournaments, error: tournamentsError } = await supabase
        .from('tournaments')
        .select('id, name, league_points_calculated')
        .eq('league_id', leagueId)
        .eq('status', 'completed')
        .eq('deleted', false);

      if (tournamentsError) throw tournamentsError;
      
      console.log(`Found ${tournaments?.length || 0} completed tournaments for league ${leagueId}`);

      // Process each tournament
      for (const tournament of tournaments || []) {
        try {
          // Get full tournament data
          const fullTournament = await tournamentService.getTournament(tournament.id);
          
          if (fullTournament) {
            console.log(`Calculating placements for tournament: ${fullTournament.name || tournament.name}`);
            
            // Calculate placements from tournament data
            const placements = this.extractPlacements(fullTournament);
            
            if (placements.length > 0) {
              // Get league scoring rules
              const { data: league } = await supabase
                .from('leagues')
                .select('scoring_rules')
                .eq('id', leagueId)
                .single();

              const scoringRules = league?.scoring_rules || {
                placementPoints: { "1": 12, "2": 9, "3": 7, "4": 5, "5": 3, "default": 1 },
                allowManualOverride: true
              };

              const placementPoints = scoringRules.placementPoints || { "1": 12, "2": 9, "3": 7, "4": 5, "5": 3, "default": 1 };

              // Award points and create results records
              const resultsToInsert = placements.map(p => {
                const points = placementPoints[p.placement.toString()] || placementPoints.default || 1;
                return {
                  league_id: leagueId,
                  tournament_id: tournament.id,
                  player_id: p.playerId,
                  placement: p.placement,
                  points_awarded: points
                };
              });

              // Upsert results
              if (resultsToInsert.length > 0) {
                const { error: insertError } = await supabase
                  .from('league_tournament_results')
                  .upsert(resultsToInsert, {
                    onConflict: 'league_id,tournament_id,player_id'
                  });

                if (insertError) {
                  console.error('Error inserting results:', insertError);
                } else {
                  console.log(`Inserted ${resultsToInsert.length} results for tournament ${fullTournament.name || tournament.name}`);
                }
              }

              // Mark tournament as calculated
              await supabase
                .from('tournaments')
                .update({ league_points_calculated: true })
                .eq('id', tournament.id);
            } else {
              console.log(`No placements found for tournament: ${fullTournament.name || tournament.name}`);
            }
          }
        } catch (error) {
          console.error(`Error calculating placements for tournament ${tournament.id}:`, error);
          // Continue with other tournaments even if one fails
        }
      }

      return { message: `Processed ${tournaments?.length || 0} tournaments` };
    } catch (error) {
      console.error('Error recalculating all results:', error);
      throw error;
    }
  },

  // Extract placements from tournament data structure
  extractPlacements(tournamentData) {
    const placements = [];
    
    // Check if tournament has playoffs
    if (tournamentData.playoffs && tournamentData.playoffs.rounds && tournamentData.playoffs.rounds.length > 0) {
      // Tournament has playoffs - use playoff results
      const rounds = tournamentData.playoffs.rounds;
      const finalRound = rounds[rounds.length - 1];
      const finalMatch = finalRound?.matches?.find(m => !m.isThirdPlaceMatch && m.status === 'completed');
      const thirdPlaceMatch = finalRound?.matches?.find(m => m.isThirdPlaceMatch);
      const thirdPlaceMatchCompleted = thirdPlaceMatch?.status === 'completed';

      // Assign placements for top positions
      if (finalMatch && finalMatch.result) {
        placements.push({
          playerId: finalMatch.result.winner,
          placement: 1
        });
        const loserId = finalMatch.result.winner === finalMatch.player1?.id 
          ? finalMatch.player2?.id 
          : finalMatch.player1?.id;
        if (loserId) {
          placements.push({
            playerId: loserId,
            placement: 2
          });
        }
      }

      // Handle 3rd place - either from 3rd place match or shared by semifinal losers
      if (thirdPlaceMatch && thirdPlaceMatchCompleted && thirdPlaceMatch.result) {
        // 3rd place match was played
        placements.push({
          playerId: thirdPlaceMatch.result.winner,
          placement: 3
        });
        // Also add the 4th place (loser of third place match)
        const fourthId = thirdPlaceMatch.result.winner === thirdPlaceMatch.player1?.id 
          ? thirdPlaceMatch.player2?.id 
          : thirdPlaceMatch.player1?.id;
        if (fourthId) {
          placements.push({
            playerId: fourthId,
            placement: 4
          });
        }
      } else if (!thirdPlaceMatch && rounds.length >= 2) {
        // No 3rd place match - both semifinal losers share 3rd place
        // Find the semifinal round (second to last)
        const semiFinalRound = rounds[rounds.length - 2];
        if (semiFinalRound && semiFinalRound.matches) {
          semiFinalRound.matches.forEach(match => {
            if (match.status === 'completed' && match.result && !match.isThirdPlaceMatch) {
              const loserId = match.result.winner === match.player1?.id 
                ? match.player2?.id 
                : match.player1?.id;
              if (loserId) {
                placements.push({
                  playerId: loserId,
                  placement: 3 // Both share 3rd place
                });
              }
            }
          });
        }
      }

      // For other players, rank by round eliminated
      const placedPlayerIds = new Set(placements.map(p => p.playerId));
      let currentPlacement = thirdPlaceMatch ? 5 : 5; // Start from 5th (after 1st, 2nd, and 3rd/3rd or 3rd/4th)
      
      // Recalculate starting placement based on what we've already placed
      currentPlacement = Math.max(...placements.map(p => p.placement)) + 1;
      
      // Process rounds from earliest (most eliminated) to latest, excluding final and semifinal (already processed)
      for (let i = 0; i < rounds.length - 2; i++) {
        const round = rounds[i];
        round.matches?.forEach(match => {
          if (match.status === 'completed' && match.result && !match.isThirdPlaceMatch) {
            const loserId = match.result.winner === match.player1?.id 
              ? match.player2?.id 
              : match.player1?.id;
            if (loserId && !placedPlayerIds.has(loserId)) {
              placements.push({
                playerId: loserId,
                placement: currentPlacement++
              });
              placedPlayerIds.add(loserId);
            }
          }
        });
      }
    } else if (tournamentData.groups && tournamentData.groups.length > 0) {
      // Group-only tournament - use group standings
      const allStandings = [];
      
      tournamentData.groups.forEach(group => {
        if (group.standings && group.standings.length > 0) {
          group.standings.forEach((standing, index) => {
            if (standing.player && standing.player.id) {
              allStandings.push({
                playerId: standing.player.id,
                groupName: group.name,
                position: index + 1,
                points: standing.points || 0,
                legDifference: (standing.legsWon || 0) - (standing.legsLost || 0),
                average: standing.average || 0
              });
            }
          });
        }
      });

      // Sort all players across groups by performance
      allStandings.sort((a, b) => {
        if (b.points !== a.points) return b.points - a.points;
        if (b.legDifference !== a.legDifference) return b.legDifference - a.legDifference;
        if (b.average !== a.average) return b.average - a.average;
        return 0;
      });

      // Assign placements
      allStandings.forEach((standing, index) => {
        placements.push({
          playerId: standing.playerId,
          placement: index + 1
        });
      });
    }
    
    return placements;
  },

  // Update leaderboard cache from league_tournament_results
  async updateLeaderboardCache(leagueId) {
    try {
      // Get all tournament results for this league
      const { data: results, error: resultsError } = await supabase
        .from('league_tournament_results')
        .select(`
          *,
          tournament:tournaments(created_at)
        `)
        .eq('league_id', leagueId);

      if (resultsError) throw resultsError;
      
      // Sort by tournament date in memory (Supabase doesn't support ordering by related fields)
      if (results) {
        results.sort((a, b) => {
          const dateA = a.tournament?.created_at ? new Date(a.tournament.created_at) : new Date(0);
          const dateB = b.tournament?.created_at ? new Date(b.tournament.created_at) : new Date(0);
          return dateB - dateA; // descending order
        });
      }

      // Aggregate by player
      const playerStats = {};
      results.forEach(result => {
        const playerId = result.player_id;
        if (!playerStats[playerId]) {
          playerStats[playerId] = {
            playerId,
            totalPoints: 0,
            tournamentsPlayed: 0,
            placements: [],
            lastTournamentAt: null
          };
        }

        playerStats[playerId].totalPoints += result.points_awarded || 0;
        playerStats[playerId].tournamentsPlayed += 1;
        playerStats[playerId].placements.push(result.placement);
        if (result.tournament && result.tournament.created_at) {
          const tournamentDate = new Date(result.tournament.created_at);
          if (!playerStats[playerId].lastTournamentAt || tournamentDate > new Date(playerStats[playerId].lastTournamentAt)) {
            playerStats[playerId].lastTournamentAt = result.tournament.created_at;
          }
        }
      });

      // Calculate stats for each player
      const leaderboardEntries = Object.values(playerStats).map(stats => {
        const placements = stats.placements.sort((a, b) => a - b);
        const avgPlacement = placements.length > 0
          ? placements.reduce((sum, p) => sum + p, 0) / placements.length
          : null;

        return {
          league_id: leagueId,
          player_id: stats.playerId,
          total_points: stats.totalPoints,
          tournaments_played: stats.tournamentsPlayed,
          best_placement: placements.length > 0 ? placements[0] : null,
          worst_placement: placements.length > 0 ? placements[placements.length - 1] : null,
          avg_placement: avgPlacement,
          last_tournament_at: stats.lastTournamentAt
        };
      });

      // Upsert leaderboard entries
      if (leaderboardEntries.length > 0) {
        const { error: upsertError } = await supabase
          .from('league_leaderboard')
          .upsert(leaderboardEntries, {
            onConflict: 'league_id,player_id'
          });

        if (upsertError) throw upsertError;
      }

      return leaderboardEntries;
    } catch (error) {
      console.error('Error updating leaderboard cache:', error);
      throw error;
    }
  },

  // Full leaderboard update: recalculate all results and update cache
  async updateLeaderboard(leagueId) {
    try {
      console.log(`Starting full leaderboard update for league ${leagueId}`);
      
      // First, recalculate all tournament results
      await this.recalculateAllResults(leagueId);
      
      // Then update the leaderboard cache
      const entries = await this.updateLeaderboardCache(leagueId);
      
      console.log(`Leaderboard updated with ${entries.length} entries`);
      return entries;
    } catch (error) {
      console.error('Error updating leaderboard:', error);
      throw error;
    }
  },

  // Transform league data from database format to app format
  transformLeague(league) {
    return {
      id: league.id,
      name: league.name,
      description: league.description,
      status: league.status,
      managerIds: league.manager_ids || [],
      createdBy: league.created_by,
      defaultTournamentSettings: league.default_tournament_settings,
      scoringRules: league.scoring_rules || {
        placementPoints: { "1": 12, "2": 9, "3": 7, "4": 5, "5": 3, "default": 1 },
        allowManualOverride: true
      },
      createdAt: league.created_at,
      updatedAt: league.updated_at
    };
  }
};


