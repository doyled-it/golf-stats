// Save complete GHIN data to JSON
import 'dotenv/config';
import { writeFileSync } from 'fs';
import { GhinClient } from 'ghin';

async function saveAllData() {
  console.log('🏌️  Fetching and saving all GHIN data...\n');

  try {
    const ghin = new GhinClient({
      username: process.env.GHIN_USERNAME,
      password: process.env.GHIN_PASSWORD,
    });

    // Get golfer info
    console.log('👤 Fetching golfer info...');
    const golfers = await ghin.golfers.search({
      ghin: parseInt(process.env.GHIN_USERNAME),
      status: 'Active'
    });

    const golfer = golfers[0];
    console.log('✓ Found:', golfer.first_name, golfer.last_name);
    console.log('  Handicap:', golfer.handicap_index);

    // Get all scores
    console.log('\n📈 Fetching scores...');
    const scoresData = await ghin.golfers.getScores(parseInt(process.env.GHIN_USERNAME), {
      count: 100  // Get last 100 rounds
    });

    console.log('✓ Fetched:', scoresData.scores.length, 'rounds');

    // Compile all data
    const allData = {
      golfer: {
        ghin: golfer.ghin,
        name: `${golfer.first_name} ${golfer.last_name}`,
        firstName: golfer.first_name,
        lastName: golfer.last_name,
        handicapIndex: golfer.handicap_index,
        club: golfer.club_name,
        state: golfer.state,
        status: golfer.status
      },
      scores: scoresData.scores,
      metadata: {
        fetchedAt: new Date().toISOString(),
        totalRounds: scoresData.scores.length,
        dateRange: {
          earliest: scoresData.scores[scoresData.scores.length - 1]?.played_at,
          latest: scoresData.scores[0]?.played_at
        }
      }
    };

    // Save to file
    const filename = 'ghin-data.json';
    writeFileSync(filename, JSON.stringify(allData, null, 2));
    console.log(`\n✅ Data saved to ${filename}`);

    // Print summary
    const usedScores = scoresData.scores.filter(s => s.used);
    const exceptionalRounds = scoresData.scores.filter(s => s.exceptional);
    const avgDiff = usedScores.reduce((sum, s) => sum + s.differential, 0) / usedScores.length;

    console.log('\n📊 Summary:');
    console.log(`  Total rounds: ${scoresData.scores.length}`);
    console.log(`  Rounds used in HI: ${usedScores.length}`);
    console.log(`  Exceptional rounds: ${exceptionalRounds.length}`);
    console.log(`  Avg differential: ${avgDiff.toFixed(2)}`);
    console.log(`  Best differential: ${Math.min(...usedScores.map(s => s.differential)).toFixed(1)}`);
    console.log(`  Worst differential: ${Math.max(...usedScores.map(s => s.differential)).toFixed(1)}`);

    // Check for stats
    const roundsWithStats = scoresData.scores.filter(s => s.statistics);
    console.log(`  Rounds with statistics: ${roundsWithStats.length}`);

    if (roundsWithStats.length > 0) {
      const avgGIR = roundsWithStats.reduce((sum, s) => sum + s.statistics.gir_percent, 0) / roundsWithStats.length;
      const avgPutts = roundsWithStats.reduce((sum, s) => sum + s.statistics.putts_total, 0) / roundsWithStats.length;
      console.log(`  Avg GIR: ${(avgGIR * 100).toFixed(1)}%`);
      console.log(`  Avg putts: ${avgPutts.toFixed(1)}`);
    }

    console.log('\n🎉 Ready to build your dashboard!');

  } catch (error) {
    console.error('\n❌ Error:', error.message);
  }
}

saveAllData();
