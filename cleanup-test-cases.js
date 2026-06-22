async function cleanupTestOrders() {
  const url = 'https://gnmhyhwoopklxxggrkyu.supabase.co/rest/v1/orders';
  const apiKey = 'sb_publishable_K-H2oJrlqT-wjqaDki9grg_eqYmS2Wz';

  const testIds = ['TEST-1DAY-PLAN', 'TEST-7DAY-PLAN', 'TEST-30DAY-PLAN'];

  console.log('Cleaning up test cases from Supabase...\n');

  for (const id of testIds) {
    const res = await fetch(`${url}?id=eq.${id}`, {
      method: 'DELETE',
      headers: { 'apikey': apiKey }
    });
    
    if (res.status === 204) {
      console.log(`✅ Successfully deleted ${id}`);
    } else {
      console.log(`❌ Failed to delete ${id}: Status ${res.status}`);
    }
  }

  console.log('\n🎉 Cleanup complete!');
}

cleanupTestOrders().catch(console.error);
