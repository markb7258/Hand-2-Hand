const { init } = require('@instantdb/admin');
const fs = require('fs');

// InstantDB credentials from state
const APP_ID = '7b67f3b1-46b2-4724-a83d-ae3f6a47b087';
const ADMIN_TOKEN = 'd7219b1a-f32f-4c0e-92af-e117bde71da5'; // InstantDB Secret

const db = init({
  appId: APP_ID,
  adminToken: ADMIN_TOKEN
});

async function exportData() {
  console.log('Starting InstantDB data export...\n');
  const data = {
    exportDate: new Date().toISOString(),
    appId: APP_ID,
    entities: {}
  };
  
  // Entity types from instant.schema.ts
  const entities = ['profiles', 'countries', 'notes', 'galleryImages'];
  
  try {
    for (const entity of entities) {
      console.log(`Exporting ${entity}...`);
      const result = await db.query({ [entity]: {} });
      data.entities[entity] = result[entity] || [];
      console.log(`  ✓ Exported ${data.entities[entity].length} ${entity} records`);
    }
    
    // Calculate totals
    const totalRecords = Object.values(data.entities).reduce((sum, arr) => sum + arr.length, 0);
    data.summary = {
      totalRecords,
      entityCounts: Object.fromEntries(
        Object.entries(data.entities).map(([k, v]) => [k, v.length])
      )
    };
    
    // Save to file
    const filename = 'instantdb-export.json';
    fs.writeFileSync(filename, JSON.stringify(data, null, 2));
    console.log(`\n✅ Export complete: ${filename}`);
    console.log(`Total records exported: ${totalRecords}`);
    console.log('Entity counts:', data.summary.entityCounts);
    
  } catch (error) {
    console.error('❌ Export failed:', error.message);
    process.exit(1);
  }
}

exportData().catch(console.error);
