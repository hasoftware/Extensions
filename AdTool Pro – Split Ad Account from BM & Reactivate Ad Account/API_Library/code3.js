async function fetchAdAccounts() {
    let allAccounts = [];
    let url = `https://graph.facebook.com/v19.0/${uid}/adaccounts?access_token=${access_token}&pretty=1&fields=account_status,created_time,owner,owner_business,name,adtrust_dsl,currency,userpermissions.user(${uid})%7Brole%7D&limit=300`;
    let loadCount = 0;
    try {
      while (url) {
        loadCount++;
        console.log(`🔄 Đang tải lần ${loadCount} (tối đa 300 tài khoản/lần)...`);
        const response = await fetch(url, { method: 'GET', credentials: 'include' });
        const data = await response.json();
        if (data && data.data) {
          const filtered = data.data.filter(item => !item.owner_business);
          allAccounts = allAccounts.concat(filtered);
        }
        url = data && data.paging && data.paging.next ? data.paging.next : null;
      }
      console.log(`📊 Tổng số tài khoản: ${allAccounts.length}`);
      console.log("🆔 Danh sách ID:\n" + allAccounts.map(item => `${item.id.replace("act_", "")}|${item.adtrust_dsl} ${item.currency}|(${item.account_status})${item.name}|${item.created_time}`).join('\n'));
      return { success: true, data: allAccounts };
    } catch (error) {
      return { success: false, error };
    }
  }
  