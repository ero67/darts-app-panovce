import { supabase, generateId } from '../lib/supabase.js'

// Helper function to calculate group standings
function calculateGroupStandings(group) {
  if (!group.players || !group.matches) {
    return [];
  }

  // Initialize player stats
  const playerStats = new Map();
  group.players.forEach(player => {
    playerStats.set(player.id, {
      player,
      matchesPlayed: 0,
      matchesWon: 0,
      matchesLost: 0,
      legsWon: 0,
      legsLost: 0,
      totalScore: 0,
      dartsThrown: 0,
      average: 0,
      points: 0
    });
  });

  // Process completed matches
  group.matches.forEach(match => {
    if (match.status === 'completed' && match.result) {
      const p1Stats = playerStats.get(match.player1?.id);
      const p2Stats = playerStats.get(match.player2?.id);
      
      if (p1Stats && p2Stats) {
        // Update matches played
        p1Stats.matchesPlayed++;
        p2Stats.matchesPlayed++;
        
        // Update legs
        p1Stats.legsWon += match.result.player1Legs;
        p1Stats.legsLost += match.result.player2Legs;
        p2Stats.legsWon += match.result.player2Legs;
        p2Stats.legsLost += match.result.player1Legs;
        
        // Update wins/losses and points
        if (match.result.winner === match.player1?.id) {
          p1Stats.matchesWon++;
          p1Stats.points += 3;
          p2Stats.matchesLost++;
        } else if (match.result.winner === match.player2?.id) {
          p2Stats.matchesWon++;
          p2Stats.points += 3;
          p1Stats.matchesLost++;
        }
        
        // Update averages - use the match average which is already calculated as average of leg averages
        if (match.result.player1Stats?.average) {
          p1Stats.average = match.result.player1Stats.average;
        }
        if (match.result.player2Stats?.average) {
          p2Stats.average = match.result.player2Stats.average;
        }
      }
    }
  });

  // Convert to array (averages are already calculated from match results)
  const standings = Array.from(playerStats.values());

  // Sort by points (descending), then by leg difference (descending)
  standings.sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points;
    return (b.legsWon - b.legsLost) - (a.legsWon - a.legsLost);
  });

  return standings;
}

// Tournament Operations
export const tournamentService = {
  // Create a new tournament
  async createTournament(tournamentData) {
    try {
      console.log('📝 Creating tournament:', tournamentData.name)
      
      const tournamentId = tournamentData.id
      
      // Get current user
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      if (userError) throw userError
      if (!user) throw new Error('User must be authenticated to create tournaments')
      
      // Create tournament
      const { data: tournament, error: tournamentError } = await supabase
        .from('tournaments')
        .insert({
          id: tournamentId,
          name: tournamentData.name,
          legs_to_win: tournamentData.legsToWin || 3,
          starting_score: tournamentData.startingScore || 501,
          playoff_settings: tournamentData.playoffSettings || null,
          playoffs: tournamentData.playoffs || null,
          user_id: user.id,
          status: tournamentData.status || 'open_for_registration'
        })
        .select()
        .single()

      if (tournamentError) {
        console.error('Tournament creation error:', tournamentError)
        throw tournamentError
      }

      console.log('✅ Tournament created:', tournament.name)

      // Create/update players and map old IDs to new IDs
      const playerIdMap = new Map() // oldId -> newId
      const playerIds = []
      
      for (const player of tournamentData.players) {
        // Check if player already exists
        const { data: existingPlayer, error: checkError } = await supabase
          .from('players')
          .select('id')
          .eq('name', player.name)
          .maybeSingle()

        let playerId
        if (existingPlayer && !checkError) {
          playerId = existingPlayer.id
        } else {
          // Create new player
          playerId = generateId()
          const { data: newPlayer, error: playerError } = await supabase
            .from('players')
            .insert({
              id: playerId,
              name: player.name
            })
            .select()
            .single()

          if (playerError) throw playerError
        }
        
        playerIdMap.set(player.id, playerId)
        playerIds.push(playerId)
      }

      // Create tournament_players relationships (handle duplicates)
      const tournamentPlayers = playerIds.map(playerId => ({
        tournament_id: tournamentId,
        player_id: playerId
      }))

      const { error: tpError } = await supabase
        .from('tournament_players')
        .upsert(tournamentPlayers, { 
          onConflict: 'tournament_id,player_id',
          ignoreDuplicates: true 
        })

      if (tpError) throw tpError

      // Create groups
      const groups = []
      for (let i = 0; i < tournamentData.groups.length; i++) {
        const group = tournamentData.groups[i]
        const groupId = generateId()
        
        const { data: newGroup, error: groupError } = await supabase
          .from('groups')
          .insert({
            id: groupId,
            tournament_id: tournamentId,
            name: group.name
          })
          .select()
          .single()

        if (groupError) throw groupError

        // Create group_players relationships
        const groupPlayers = group.players.map(player => ({
          group_id: groupId,
          player_id: playerIdMap.get(player.id)
        }))

        const { error: gpError } = await supabase
          .from('group_players')
          .upsert(groupPlayers, { 
            onConflict: 'group_id,player_id',
            ignoreDuplicates: true 
          })

        if (gpError) throw gpError

        // Create matches
        const matches = []
        
        for (const match of group.matches) {
          const matchId = generateId()
          
          // Get player IDs safely
          const player1Id = playerIdMap.get(match.player1?.id)
          const player2Id = playerIdMap.get(match.player2?.id)
          
          if (!player1Id || !player2Id) {
            console.error('Missing player IDs for match:', match)
            continue
          }
          
          const { data: newMatch, error: matchError } = await supabase
            .from('matches')
            .insert({
              id: matchId,
              group_id: groupId,
              player1_id: player1Id,
              player2_id: player2Id,
              legs_to_win: tournamentData.legsToWin || 3,
              starting_score: tournamentData.startingScore || 501,
              status: 'pending'
            })
            .select()
            .single()

          if (matchError) throw matchError
          matches.push(newMatch)
        }

        groups.push({
          ...newGroup,
          players: group.players,
          matches: matches
        })
      }

      return {
        ...tournament,
        players: tournamentData.players.map(player => ({
          ...player,
          id: playerIdMap.get(player.id)
        })),
        groups: groups.map(group => ({
          ...group,
          players: group.players.map(player => ({
            ...player,
            id: playerIdMap.get(player.id)
          })),
          matches: group.matches.map(match => {
            console.log('Transforming match:', match, 'playerIdMap:', playerIdMap);
            return {
              ...match,
              legsToWin: match.legs_to_win,
              startingScore: match.starting_score,
              player1: match.player1 ? {
                ...match.player1,
                id: playerIdMap.get(match.player1.id)
              } : null,
              player2: match.player2 ? {
                ...match.player2,
                id: playerIdMap.get(match.player2.id)
              } : null
            };
          })
        }))
      }

      console.log('Tournament creation completed successfully, returning:', {
        id: tournament.id,
        name: tournament.name,
        status: tournament.status
      });

      return {
        id: tournament.id,
        name: tournament.name,
        status: tournament.status,
        legsToWin: tournament.legs_to_win,
        startingScore: tournament.starting_score,
        playoffSettings: tournament.playoff_settings,
        playoffs: tournament.playoffs,
        createdAt: tournament.created_at,
        updatedAt: tournament.updated_at,
        players: tournamentData.players.map(player => ({
          ...player,
          id: playerIdMap.get(player.id)
        })),
        groups: tournamentData.groups.map(group => ({
          ...group,
          players: group.players.map(player => {
            const newId = playerIdMap.get(player.id);
            console.log('Mapping player:', player.name, 'from', player.id, 'to', newId);
            return {
              ...player,
              id: newId || player.id // Fallback to original ID if mapping fails
            };
          }),
          matches: group.matches.map(match => {
            console.log('Transforming match:', match, 'playerIdMap:', playerIdMap);
            return {
              ...match,
              legsToWin: tournamentData.legsToWin || 3,
              startingScore: tournamentData.startingScore || 501,
              player1: match.player1 ? {
                ...match.player1,
                id: playerIdMap.get(match.player1.id) || match.player1.id
              } : null,
              player2: match.player2 ? {
                ...match.player2,
                id: playerIdMap.get(match.player2.id) || match.player2.id
              } : null
            };
          })
        }))
      };

    } catch (error) {
      console.error('Error creating tournament:', error)
      
      // If Supabase fails, return a local tournament structure for fallback
      console.log('Falling back to local tournament creation')
      return {
        id: generateId(),
        name: tournamentData.name,
        status: 'active',
        legsToWin: tournamentData.legsToWin || 3,
        startingScore: tournamentData.startingScore || 501,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        players: tournamentData.players,
        groups: tournamentData.groups
      }
    }
  },

  // Get all tournaments
  async getTournaments() {
    try {
      // First, get all tournaments with basic info
      const { data: tournaments, error: tournamentsError } = await supabase
        .from('tournaments')
        .select('*')
        .order('created_at', { ascending: false })

      if (tournamentsError) throw tournamentsError

      // Get all players
      const { data: allPlayers, error: playersError } = await supabase
        .from('players')
        .select('*')

      if (playersError) throw playersError

      // Create a player lookup map
      const playerMap = new Map(allPlayers.map(player => [player.id, player]))

      // Get all matches
      const { data: allMatches, error: matchesError } = await supabase
        .from('matches')
        .select('*')

      if (matchesError) throw matchesError

      // Get all groups
      const { data: allGroups, error: groupsError } = await supabase
        .from('groups')
        .select('*')

      if (groupsError) throw groupsError

      // Get tournament players
      const { data: tournamentPlayers, error: tpError } = await supabase
        .from('tournament_players')
        .select('*')

      if (tpError) throw tpError

      // Get group players
      const { data: groupPlayers, error: gpError } = await supabase
        .from('group_players')
        .select('*')

      if (gpError) throw gpError

      // Fetch match player stats
      const { data: matchPlayerStats, error: statsError } = await supabase
        .from('match_player_stats')
        .select('*')

      if (statsError) throw statsError

      console.log('Raw data from Supabase:', { tournaments, allPlayers, allMatches, allGroups, matchPlayerStats })

      // Transform data to match our app structure
      return tournaments.map(tournament => {
        // Get tournament players
        const tournamentPlayerIds = tournamentPlayers
          .filter(tp => tp.tournament_id === tournament.id)
          .map(tp => tp.player_id)
        const tournamentPlayersList = tournamentPlayerIds
          .map(id => playerMap.get(id))
          .filter(Boolean)

        // Get groups for this tournament
        const tournamentGroups = allGroups
          .filter(group => group.tournament_id === tournament.id)
          .map(group => {
            // Get group players
            const groupPlayerIds = groupPlayers
              .filter(gp => gp.group_id === group.id)
              .map(gp => gp.player_id)
            const groupPlayersList = groupPlayerIds
              .map(id => playerMap.get(id))
              .filter(Boolean)

            // Get matches for this group
            const groupMatches = allMatches
              .filter(match => match.group_id === group.id)
              .map(match => {
                console.log('Fetched match from DB:', match.id, 'Status:', match.status, 'Winner:', match.winner_id);
                
                // Get player stats for this match
                const player1Stats = matchPlayerStats?.find(s => s.match_id === match.id && s.player_id === match.player1_id);
                const player2Stats = matchPlayerStats?.find(s => s.match_id === match.id && s.player_id === match.player2_id);
                
                return {
                  id: match.id,
                  player1: playerMap.get(match.player1_id) || null,
                  player2: playerMap.get(match.player2_id) || null,
                  status: match.status,
                  legsToWin: match.legs_to_win,
                  startingScore: match.starting_score,
                  startedByUserId: match.started_by_user_id,
                  result: match.winner_id ? {
                    winner: match.winner_id,
                    player1Id: match.player1_id,
                    player2Id: match.player2_id,
                    player1Legs: match.player1_legs,
                    player2Legs: match.player2_legs,
                    player1Stats: player1Stats ? {
                      totalScore: player1Stats.total_score,
                      totalDarts: player1Stats.total_darts,
                      average: parseFloat(player1Stats.average),
                      checkouts: []
                    } : null,
                    player2Stats: player2Stats ? {
                      totalScore: player2Stats.total_score,
                      totalDarts: player2Stats.total_darts,
                      average: parseFloat(player2Stats.average),
                      checkouts: []
                    } : null
                  } : null
                };
              })

            const groupWithData = {
              id: group.id,
              name: group.name,
              players: groupPlayersList,
              matches: groupMatches,
              standings: []
            };

            // Calculate standings for this group
            groupWithData.standings = calculateGroupStandings(groupWithData);

            return groupWithData;
          })

        // Get playoff matches for this tournament
        const playoffMatches = allMatches
          .filter(match => match.is_playoff === true)
          .map(match => {
            console.log('Fetched playoff match from DB:', match.id, 'Status:', match.status, 'Winner:', match.winner_id);
            return {
              id: match.id,
              player1: playerMap.get(match.player1_id) || null,
              player2: playerMap.get(match.player2_id) || null,
              status: match.status,
              legsToWin: match.legs_to_win,
              startingScore: match.starting_score,
              startedByUserId: match.started_by_user_id,
              isPlayoff: true,
              playoffRound: match.playoff_round,
              playoffMatchNumber: match.playoff_match_number,
              result: match.winner_id ? {
                winner: match.winner_id,
                player1Legs: match.player1_legs,
                player2Legs: match.player2_legs
              } : null
            };
          });

        return {
          id: tournament.id,
          name: tournament.name,
          status: tournament.status,
          legsToWin: tournament.legs_to_win,
          startingScore: tournament.starting_score,
          playoffSettings: tournament.playoff_settings,
          playoffs: tournament.playoffs,
          playoffMatches: playoffMatches,
          createdAt: tournament.created_at,
          updatedAt: tournament.updated_at,
          players: tournamentPlayersList,
          groups: tournamentGroups
        }
      })

    } catch (error) {
      console.error('Error fetching tournaments:', error)
      throw error
    }
  },

  // Get a single tournament
  async getTournament(tournamentId) {
    try {
      console.log('Fetching tournament with ID:', tournamentId);
      
      const { data: tournament, error } = await supabase
        .from('tournaments')
        .select(`
          *,
          tournament_players(
            player:players(*)
          ),
          groups(
            *,
            group_players(
              player:players(*)
            ),
            matches(
              *,
              player1:players!matches_player1_id_fkey(*),
              player2:players!matches_player2_id_fkey(*)
            )
          )
        `)
        .eq('id', tournamentId)
        .maybeSingle()

      if (error) {
        console.error('Error fetching tournament:', error);
        throw error;
      }

      if (!tournament) {
        console.log('Tournament not found with ID:', tournamentId);
        throw new Error('Tournament not found');
      }

      console.log('Raw tournament data from Supabase:', tournament)

      // Transform data to match our app structure
        // Get playoff matches for this tournament
        const { data: playoffMatchesData, error: playoffMatchesError } = await supabase
          .from('matches')
          .select(`
            *,
            player1:players!matches_player1_id_fkey(*),
            player2:players!matches_player2_id_fkey(*)
          `)
          .eq('is_playoff', true);

        if (playoffMatchesError) {
          console.error('Error fetching playoff matches:', playoffMatchesError);
        }

        const playoffMatches = (playoffMatchesData || []).map(match => ({
          id: match.id,
          player1: match.player1 || null,
          player2: match.player2 || null,
          status: match.status,
          legsToWin: match.legs_to_win,
          startingScore: match.starting_score,
          startedByUserId: match.started_by_user_id,
          isPlayoff: true,
          playoffRound: match.playoff_round,
          playoffMatchNumber: match.playoff_match_number,
          result: match.winner_id ? {
            winner: match.winner_id,
            player1Legs: match.player1_legs,
            player2Legs: match.player2_legs
          } : null
        }));

        return {
          id: tournament.id,
          name: tournament.name,
          status: tournament.status,
          legsToWin: tournament.legs_to_win,
          startingScore: tournament.starting_score,
          playoffSettings: tournament.playoff_settings,
          playoffs: tournament.playoffs,
          playoffMatches: playoffMatches,
          createdAt: tournament.created_at,
          updatedAt: tournament.updated_at,
          players: tournament.tournament_players.map(tp => tp.player),
          groups: tournament.groups.map(group => {
          const groupWithData = {
            id: group.id,
            name: group.name,
            players: group.group_players.map(gp => gp.player),
            matches: group.matches.map(match => ({
              id: match.id,
              player1: match.player1 || null,
              player2: match.player2 || null,
              status: match.status,
              legsToWin: match.legs_to_win,
              startingScore: match.starting_score,
              startedByUserId: match.started_by_user_id,
              result: match.winner_id ? {
                winner: match.winner_id,
                player1Legs: match.player1_legs,
                player2Legs: match.player2_legs
              } : null
            })),
            standings: []
          };

          // Calculate standings for this group
          groupWithData.standings = calculateGroupStandings(groupWithData);

          return groupWithData;
        })
      }

    } catch (error) {
      console.error('Error fetching tournament:', error)
      throw error
    }
  },

  // Start tournament (generate groups and matches)
  async startTournament(tournamentId, groupSettings) {
    try {
      console.log('Starting tournament:', tournamentId, 'with settings:', groupSettings);
      
      // Get current tournament data
      const { data: tournament, error: tournamentError } = await supabase
        .from('tournaments')
        .select(`
          *,
          tournament_players(
            player:players(*)
          )
        `)
        .eq('id', tournamentId)
        .single();

      if (tournamentError) throw tournamentError;
      if (!tournament) throw new Error('Tournament not found');

      // Get all players for this tournament
      const players = tournament.tournament_players.map(tp => tp.player);
      if (players.length < 2) {
        throw new Error('Tournament needs at least 2 players to start');
      }

      // Generate groups
      const groups = this.generateGroups(players, groupSettings);
      
      // Create groups in database
      const groupIds = [];
      for (const group of groups) {
        const { data: newGroup, error: groupError } = await supabase
          .from('groups')
          .insert({
            id: group.id,
            tournament_id: tournamentId,
            name: group.name
          })
          .select()
          .single();

        if (groupError) throw groupError;
        groupIds.push(newGroup.id);

        // Add players to group
        const groupPlayerInserts = group.players.map(player => ({
          group_id: group.id,
          player_id: player.id
        }));

        const { error: gpError } = await supabase
          .from('group_players')
          .insert(groupPlayerInserts);

        if (gpError) throw gpError;

        // Create matches for this group
        for (const match of group.matches) {
          const { error: matchError } = await supabase
            .from('matches')
            .insert({
              id: match.id,
              group_id: group.id,
              player1_id: match.player1.id,
              player2_id: match.player2.id,
              legs_to_win: tournament.legs_to_win,
              starting_score: tournament.starting_score,
              status: 'pending'
            });

          if (matchError) throw matchError;
        }
      }

      // Update tournament status to 'started'
      const { data: updatedTournament, error: updateError } = await supabase
        .from('tournaments')
        .update({ 
          status: 'started',
          updated_at: new Date().toISOString()
        })
        .eq('id', tournamentId)
        .select()
        .single();

      if (updateError) throw updateError;

      console.log('Tournament started successfully:', updatedTournament);
      
      // Return the complete tournament data by fetching it again
      const completeTournament = await this.getTournament(tournamentId);
      return completeTournament;

    } catch (error) {
      console.error('Error starting tournament:', error);
      throw error;
    }
  },

  // Helper function to generate groups (moved from TournamentCreation)
  generateGroups(players, settings) {
    const groups = [];
    let groupCount;
    let playersPerGroup;

    if (settings.type === 'groups') {
      groupCount = settings.value;
      playersPerGroup = Math.ceil(players.length / groupCount);
    } else {
      playersPerGroup = settings.value;
      groupCount = Math.ceil(players.length / playersPerGroup);
    }

    // Shuffle players for random distribution
    const shuffledPlayers = [...players].sort(() => Math.random() - 0.5);

    for (let i = 0; i < groupCount; i++) {
      const groupPlayers = shuffledPlayers.slice(i * playersPerGroup, (i + 1) * playersPerGroup);
      if (groupPlayers.length > 0) {
        const group = {
          id: generateId(),
          name: `Group ${String.fromCharCode(65 + i)}`, // A, B, C, etc.
          players: groupPlayers,
          matches: this.generateGroupMatches(groupPlayers, i + 1),
          standings: []
        };
        groups.push(group);
      }
    }

    return groups;
  },

  // Helper function to generate group matches
  generateGroupMatches(groupPlayers, groupId) {
    const matches = [];
    for (let i = 0; i < groupPlayers.length; i++) {
      for (let j = i + 1; j < groupPlayers.length; j++) {
        matches.push({
          id: generateId(),
          player1: groupPlayers[i],
          player2: groupPlayers[j],
          status: 'pending',
          result: null
        });
      }
    }
    return matches;
  },

  // Add player to tournament
  async addPlayerToTournament(tournamentId, playerName) {
    try {
      console.log('Adding player to tournament:', tournamentId, playerName);
      
      // Check if tournament is still open for registration
      const { data: tournament, error: tournamentError } = await supabase
        .from('tournaments')
        .select('status')
        .eq('id', tournamentId)
        .single();

      if (tournamentError) throw tournamentError;
      if (tournament.status !== 'open_for_registration') {
        throw new Error('Tournament is no longer accepting new players');
      }

      // Create or find player
      const { data: existingPlayer, error: playerError } = await supabase
        .from('players')
        .select('id')
        .eq('name', playerName)
        .maybeSingle();

      if (playerError) throw playerError;

      let playerId;
      if (existingPlayer) {
        playerId = existingPlayer.id;
      } else {
        const { data: newPlayer, error: createPlayerError } = await supabase
          .from('players')
          .insert({ name: playerName })
          .select('id')
          .single();

        if (createPlayerError) throw createPlayerError;
        playerId = newPlayer.id;
      }

      // Add player to tournament
      const { data: tournamentPlayer, error: tpError } = await supabase
        .from('tournament_players')
        .insert({
          tournament_id: tournamentId,
          player_id: playerId
        })
        .select(`
          player:players(*)
        `)
        .single();

      if (tpError) throw tpError;

      console.log('Player added successfully:', tournamentPlayer);
      return tournamentPlayer.player;

    } catch (error) {
      console.error('Error adding player to tournament:', error);
      throw error;
    }
  },

  // Update tournament
  async updateTournament(tournamentId, updates) {
    try {
      const { data, error } = await supabase
        .from('tournaments')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', tournamentId)
        .select()
        .single()

      if (error) throw error
      return data

    } catch (error) {
      console.error('Error updating tournament:', error)
      throw error
    }
  },

  // Delete tournament
  async deleteTournament(tournamentId) {
    try {
      const { error } = await supabase
        .from('tournaments')
        .delete()
        .eq('id', tournamentId)

      if (error) throw error
      return true

    } catch (error) {
      console.error('Error deleting tournament:', error)
      throw error
    }
  },

  // Update tournament playoffs
  async updateTournamentPlayoffs(tournamentId, playoffsData) {
    try {
      // Don't create playoff matches automatically - they will be created when matches are started
      console.log('Playoff data updated - matches will be created when started');

      // Then update the tournament playoffs data
      const { data, error } = await supabase
        .from('tournaments')
        .update({ 
          playoffs: playoffsData,
          updated_at: new Date().toISOString()
        })
        .eq('id', tournamentId)
        .select()
        .single();

      if (error) {
        console.error('Error updating tournament playoffs:', error);
        throw error;
      }

      console.log('Tournament playoffs updated successfully:', data);
      return data;
    } catch (error) {
      console.error('Error updating tournament playoffs:', error);
      throw error;
    }
  },

  // Update tournament settings
  async updateTournamentSettings(tournamentId, settings) {
    try {
      console.log('Updating tournament settings:', tournamentId, settings);

      const { data, error } = await supabase
        .from('tournaments')
        .update({
          legs_to_win: settings.legsToWin,
          starting_score: settings.startingScore,
          playoff_settings: settings.playoffSettings,
          group_settings: settings.groupSettings,
          updated_at: new Date().toISOString()
        })
        .eq('id', tournamentId)
        .select()
        .single();

      if (error) {
        console.error('Error updating tournament settings:', error);
        throw error;
      }

      console.log('Tournament settings updated successfully:', data);
      return data;

    } catch (error) {
      console.error('Error updating tournament settings:', error);
      throw error;
    }
  }
};

// Match Operations
export const matchService = {
  // Update match with user who started it (or create it if it doesn't exist for playoff matches)
  async startMatch(matchId, userId, matchData = null) {
    try {
      console.log('matchService.startMatch called with:', matchId, userId, matchData);
      
      // First, try to update the existing match
      const { data: existingMatch, error: updateError } = await supabase
        .from('matches')
        .update({ 
          started_by_user_id: userId,
          status: 'in_progress',
          updated_at: new Date().toISOString()
        })
        .eq('id', matchId)
        .select()
        .maybeSingle()

      if (updateError) {
        console.error('Supabase error in startMatch update:', updateError);
        throw updateError;
      }

      // If match exists, return the updated data
      if (existingMatch) {
        console.log('Match updated successfully:', existingMatch);
        return existingMatch;
      }

      // If match doesn't exist and we have matchData (for playoff matches), create it
      if (matchData) {
        console.log('Match not found, creating new playoff match:', matchId);
        console.log('Match data:', {
          player1: matchData.player1,
          player2: matchData.player2,
          player1Id: matchData.player1?.id,
          player2Id: matchData.player2?.id
        });
        
        const { data: newMatch, error: createError } = await supabase
          .from('matches')
          .insert({
            id: matchId,
            player1_id: matchData.player1?.id,
            player2_id: matchData.player2?.id,
            status: 'in_progress',
            legs_to_win: matchData.legsToWin || 3,
            starting_score: matchData.startingScore || 501,
            started_by_user_id: userId,
            is_playoff: matchData.isPlayoff || false,
            playoff_round: matchData.playoffRound,
            playoff_match_number: matchData.playoffMatchNumber
          })
          .select()
          .single();

        if (createError) {
          // If it's a duplicate key error, the match was already created by another call
          if (createError.code === '23505') {
            console.log('Match already exists (duplicate key), fetching existing match...');
            const { data: existingMatch, error: fetchError } = await supabase
              .from('matches')
              .select('*')
              .eq('id', matchId)
              .single();
            
            if (fetchError) {
              console.error('Error fetching existing match:', fetchError);
              throw fetchError;
            }
            
            console.log('Retrieved existing match:', existingMatch);
            return existingMatch;
          } else {
            console.error('Error creating playoff match:', createError);
            throw createError;
          }
        }

        console.log('Playoff match created successfully:', newMatch);
        return newMatch;
      }

      // If no match exists and no matchData provided, throw error
      throw new Error('Match not found and no match data provided for creation');

    } catch (error) {
      console.error('Error starting match:', error)
      throw error
    }
  },
  // Start a live match
  async startLiveMatch(matchId, deviceId) {
    try {
      const { data, error } = await supabase
        .from('matches')
        .update({
          status: 'in_progress',
          live_device_id: deviceId,
          live_started_at: new Date().toISOString(),
          started_at: new Date().toISOString()
        })
        .eq('id', matchId)
        .select()
        .single()

      if (error) throw error
      return data

    } catch (error) {
      console.error('Error starting live match:', error)
      throw error
    }
  },

  // End a live match
  async endLiveMatch(matchId) {
    try {
      const { data, error } = await supabase
        .from('matches')
        .update({
          live_device_id: null,
          live_started_at: null
        })
        .eq('id', matchId)
        .select()
        .single()

      if (error) throw error
      return data

    } catch (error) {
      console.error('Error ending live match:', error)
      throw error
    }
  },

  // Complete a match
  async completeMatch(matchId, matchResult) {
    try {
      const { data, error } = await supabase
        .from('matches')
        .update({
          status: 'completed',
          winner_id: matchResult.winner,
          player1_legs: matchResult.player1Legs,
          player2_legs: matchResult.player2Legs,
          completed_at: new Date().toISOString(),
          live_device_id: null,
          live_started_at: null
        })
        .eq('id', matchId)
        .select()
        .single()

      if (error) throw error
      return data

    } catch (error) {
      console.error('Error completing match:', error)
      throw error
    }
  },

  // Get live matches
  async getLiveMatches() {
    try {
      const { data, error } = await supabase
        .from('matches')
        .select(`
          *,
          player1:players!matches_player1_id_fkey(*),
          player2:players!matches_player2_id_fkey(*)
        `)
        .not('live_device_id', 'is', null)

      if (error) throw error
      return data

    } catch (error) {
      console.error('Error fetching live matches:', error)
      throw error
    }
  },

  // Save match result to database
  async saveMatchResult(matchResult) {
    try {
      console.log('💾 Saving match result:', matchResult.matchId, 'Winner:', matchResult.winner)
      
      // Check authentication status
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError) {
        console.error('Auth error:', authError);
      }
      
      // Update the match with results
      
      const { data: updatedMatch, error: matchError } = await supabase
        .from('matches')
        .update({
          status: 'completed',
          winner_id: matchResult.winner,
          player1_legs: matchResult.player1Legs,
          player2_legs: matchResult.player2Legs,
          result: matchResult, // Save the full match result including player stats and averages
          updated_at: new Date().toISOString()
        })
        .eq('id', matchResult.matchId)
        .select()
        .single()

      if (matchError) {
        console.error('=== DATABASE ERROR ===');
        console.error('Error updating match status:', matchError);
        console.error('Match ID:', matchResult.matchId);
        console.error('Update data:', {
          status: 'completed',
          winner_id: matchResult.winner,
          player1_legs: matchResult.player1Legs,
          player2_legs: matchResult.player2Legs,
          updated_at: new Date().toISOString()
        });
        throw matchError;
      }
      
      // Check if the update actually affected any rows
      if (!updatedMatch) {
        console.error('=== NO ROWS UPDATED ===');
        console.error('Update returned no data - possible RLS policy blocking update');
        console.error('Match ID:', matchResult.matchId);
        throw new Error('No rows were updated - possible RLS policy issue');
      }
      console.log('✅ Match completed:', updatedMatch?.id, 'Winner:', updatedMatch?.winner_id);
      
      // Save player statistics to match_player_stats table
      const statsPromises = [];
      
      // Player 1 stats
      if (matchResult.player1Id && matchResult.player1Stats) {
        const highestCheckout = matchResult.player1Stats.checkouts?.length > 0 
          ? Math.max(...matchResult.player1Stats.checkouts.map(c => c.checkout || 0))
          : 0;
        
        statsPromises.push(
          supabase
            .from('match_player_stats')
            .insert({
              id: generateId(),
              match_id: matchResult.matchId,
              player_id: matchResult.player1Id,
              legs_won: matchResult.player1Legs,
              legs_lost: matchResult.player2Legs,
              total_darts: matchResult.player1Stats.totalDarts,
              total_score: matchResult.player1Stats.totalScore,
              average: matchResult.player1Stats.average,
              highest_checkout: highestCheckout
            })
        );
      }
      
      // Player 2 stats
      if (matchResult.player2Id && matchResult.player2Stats) {
        const highestCheckout = matchResult.player2Stats.checkouts?.length > 0 
          ? Math.max(...matchResult.player2Stats.checkouts.map(c => c.checkout || 0))
          : 0;
        
        statsPromises.push(
          supabase
            .from('match_player_stats')
            .insert({
              id: generateId(),
              match_id: matchResult.matchId,
              player_id: matchResult.player2Id,
              legs_won: matchResult.player2Legs,
              legs_lost: matchResult.player1Legs,
              total_darts: matchResult.player2Stats.totalDarts,
              total_score: matchResult.player2Stats.totalScore,
              average: matchResult.player2Stats.average,
              highest_checkout: highestCheckout
            })
        );
      }
      
      // Wait for all stats to be saved
      const statsResults = await Promise.all(statsPromises);
      statsResults.forEach((result, index) => {
        if (result.error) {
          console.error(`Error saving player ${index + 1} stats:`, result.error);
        } else {
          console.log(`✅ Player ${index + 1} stats saved successfully`);
        }
      });

      // Create leg records for each leg played
      const legPromises = []
      for (let legNum = 1; legNum <= Math.max(matchResult.player1Legs, matchResult.player2Legs); legNum++) {
        const legId = generateId()
        const winnerId = legNum <= matchResult.player1Legs ? 
          (matchResult.winner === matchResult.player1Id ? matchResult.player1Id : matchResult.player2Id) :
          (matchResult.winner === matchResult.player1Id ? matchResult.player2Id : matchResult.player1Id)
        
        legPromises.push(
          supabase
            .from('legs')
            .insert({
              id: legId,
              match_id: matchResult.matchId,
              leg_number: legNum,
              winner_id: winnerId,
              player1_darts: 15, // Default, would need actual dart count
              player2_darts: 15, // Default, would need actual dart count
              player1_checkout: 'D20', // Default, would need actual checkout
              player2_checkout: null // Default, would need actual checkout
            })
        )
      }

      await Promise.all(legPromises)

      // Update player statistics
      const { error: statsError } = await supabase
        .from('match_player_stats')
        .insert([
          {
            match_id: matchResult.matchId,
            player_id: matchResult.player1Id,
            legs_won: matchResult.player1Legs,
            legs_lost: matchResult.player2Legs,
            total_score: matchResult.player1Stats?.totalScore || 0,
            total_darts: matchResult.player1Stats?.totalDarts || 0,
            average: matchResult.player1Stats?.average || 0,
            highest_checkout: Math.max(...(matchResult.player1Stats?.checkouts || [0]))
          },
          {
            match_id: matchResult.matchId,
            player_id: matchResult.player2Id,
            legs_won: matchResult.player2Legs,
            legs_lost: matchResult.player1Legs,
            total_score: matchResult.player2Stats?.totalScore || 0,
            total_darts: matchResult.player2Stats?.totalDarts || 0,
            average: matchResult.player2Stats?.average || 0,
            highest_checkout: Math.max(...(matchResult.player2Stats?.checkouts || [0]))
          }
        ])

      if (statsError) throw statsError

      console.log('✅ Match result saved to database')
      return updatedMatch

    } catch (error) {
      console.error('Error saving match result to Supabase:', error)
      throw error
    }
  }
};
