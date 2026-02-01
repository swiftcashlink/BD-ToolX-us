import { autoDistributor } from './auto-distributor';

async function generateIntelligenceReport() {
  console.log('--- BDTOOLX INTELLIGENCE REPORT ---');
  
  const report = autoDistributor.getDistributionReport();
  
  console.log('\nPLATFORM ALLOCATION:');
  Object.entries(report).forEach(([platform, data]) => {
    console.log(`[${platform}] Nodes: ${data.count} | Setups: ${Array.from(data.setups).join(', ')}`);
  });

  console.log('\n--- REPORT COMPLETE ---');
}

generateIntelligenceReport();