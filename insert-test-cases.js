async function createTestOrders() {
  const url = 'https://gnmhyhwoopklxxggrkyu.supabase.co/rest/v1/orders';
  const apiKey = 'sb_publishable_K-H2oJrlqT-wjqaDki9grg_eqYmS2Wz';

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowStr = tomorrow.toISOString().split('T')[0];

  console.log(`Setting up test cases starting tomorrow: ${tomorrowStr}\n`);

  const testOrders = [
    {
      id: 'TEST-1DAY-PLAN',
      items: [
        { name: 'Peanut Butter Power Oats', price: 149, qty: 1 }
      ],
      customer: {
        name: 'Test 1-Day Customer',
        phone: '9999999901',
        address: 'Test Flat 101, Chef Lane, Hyderabad',
        timeSlot: '7:00-8:00 AM',
        startDate: tomorrowStr,
        notes: 'Test Case: Delivery only tomorrow'
      },
      plan: {
        id: 'oneday',
        name: '1 Day',
        duration: 1,
        discountPercentage: 0
      },
      total_price: 149,
      status: 'confirmed'
    },
    {
      id: 'TEST-7DAY-PLAN',
      items: [
        { name: 'Cocoa Banana Oat Cup', price: 150, qty: 1 }
      ],
      customer: {
        name: 'Test 7-Day Customer',
        phone: '9999999907',
        address: 'Test Flat 707, Diet Avenue, Hyderabad',
        timeSlot: '8:00-9:00 AM',
        startDate: tomorrowStr,
        notes: 'Test Case: Delivery for 7 days starting tomorrow'
      },
      plan: {
        id: 'weekly',
        name: '7 Days',
        duration: 7,
        discountPercentage: 10
      },
      total_price: 945, // 150 * 7 = 1050 - 10% = 945
      status: 'confirmed'
    },
    {
      id: 'TEST-30DAY-PLAN',
      items: [
        { name: 'Chocolate Fiber Overnight Oats', price: 160, qty: 1 }
      ],
      customer: {
        name: 'Test 30-Day Customer',
        phone: '9999999930',
        address: 'Test Flat 3030, Fitness Boulevard, Hyderabad',
        timeSlot: '6:00-7:00 AM',
        startDate: tomorrowStr,
        notes: 'Test Case: Delivery for 30 days starting tomorrow'
      },
      plan: {
        id: 'monthly',
        name: '30 Days',
        duration: 30,
        discountPercentage: 25
      },
      total_price: 3600, // 160 * 30 = 4800 - 25% = 3600
      status: 'confirmed'
    }
  ];

  for (const order of testOrders) {
    console.log(`Inserting order: ${order.id}...`);
    // Delete existing test case if present to avoid duplicate key error
    await fetch(`${url}?id=eq.${order.id}`, {
      method: 'DELETE',
      headers: { 'apikey': apiKey }
    });

    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'apikey': apiKey,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation'
      },
      body: JSON.stringify(order)
    });
    
    if (res.status === 201) {
      console.log(`✅ Successfully inserted ${order.id}`);
    } else {
      const errorText = await res.text();
      console.error(`❌ Failed to insert ${order.id}:`, errorText);
    }
  }

  console.log('\n🎉 Test cases created! Open the Admin Dashboard -> Subscriptions Tab.');
  console.log('You should see:');
  console.log(`- Tomorrow (${tomorrowStr}): Total Deliveries increases by 3 (1D: 1, 7D: 1, 30D: 1)`);
  console.log(`- Next 6 Days: Total Deliveries increases by 2 (7D: 1, 30D: 1)`);
}

createTestOrders().catch(console.error);
