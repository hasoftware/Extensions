console.log("Copyright maxvia88.com - Ads solution");
//update tự thêm quyền khi không đủ quyền
//update load nhiều hơn 1000 tkqc
//ae coppy nhớ ghi nguồn. thanks ae chúc ae mùa tút bội thu
const delay = 0;
let access_token;
let fb_dtsg2 = require("DTSGInitialData").token || document.querySelector('[name="fb_dtsg"]').value;
let uid = require("CurrentUserInitialData").USER_ID || [removed].match(/c_user=(\d+)/)[1];

try {
  access_token = require("WebApiApplication").getAccessToken();
} catch (error) {}

if (!access_token) {
  alert(`Please go to https://adsmanager.facebook.com and try again`);
  window.location.href = "https://adsmanager.facebook.com/adsmanager/manage/campaigns?act=";
}
main();
async function main() {
  console.log(`🚀 Bắt đầu lấy danh sách tài khoản quảng cáo...`);
  const { success, data, error } = await fetchAdAccounts();
  if (!success) {
    console.log("❌ Lỗi khi lấy tài khoản:", error);
    alert("Không lấy được danh sách tài khoản!");
    return;
  }
  await processAdAccounts(data);
}
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
async function processAdAccounts(accounts) {
  let successCount = 0;
  for (let i = 0; i < accounts.length; i++) {
    const acc = accounts[i];
    const businessID = acc.id.replace("act_", "");
    // if (acc.userpermissions && acc.userpermissions.data && acc.userpermissions.data[0].role !== "ADMIN") {
    //   var ok = await addpermission(businessID, acc.owner);
    //   if (ok.status){
    //     console.log(`✅ ${i + 1}/${accounts.length} act_${businessID}| -> add permission success`);
    //   }else{
    //     console.log(`❌ ${i + 1}/${accounts.length} act_${businessID}| -> add permission error: ${ok.error}`);
    //   }
    //   await delayMs(delay * 1000);
    // }
    if (acc.account_status === 100 || acc.account_status === 101) {
      const ok = await reactivateAdAccount(businessID, i, accounts.length);
      if (ok) successCount++;
      await delayMs(delay * 1000);
    }
  }
  console.log(`✅ Done! Đã kích hoạt thành công ${successCount}/${accounts.length} tài khoản.\nmaxvia88.com - Ads solution`);
  alert(`Active success ${successCount}/${accounts.length} \nmaxvia88.com - Ads solution`);
  window.open("https://www.facebook.com/ads/manager/accounts/?act=", "_blank");
}

async function reactivateAdAccount(businessID, index, total) {
  const url = `https://adsmanager.facebook.com/api/graphql/?_callFlowletID=0&_triggerFlowletID=78266`;
  try {
    const response = await fetch(url, {
      method: 'POST',
      body: buildRequestBody(businessID),
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    });
    const responseText = await response.text();
    if (responseText.includes('status":"ADMARKET_ACCOUNT_STATUS_ACTIVE')) {
      console.log(`🎉 ${index + 1}/${total} ACTIVE act_${businessID}| -> success`);
      return true;
    } else {
      console.log(`❌ ${index + 1}/${total} ACTIVE act_${businessID}| -> Error: ${responseText}`);
      return false;
    }
  } catch (error) {
    console.log(`⚠️ ${index + 1}/${total} act_${businessID}| -> Error: ${error}`);
    return false;
  }
}


async function addpermission(adAccountId, business) {
  const rawJson = {
      input: {
          business_id: business,
          payment_legacy_account_id: adAccountId,
          actor_id: uid,
          client_mutation_id: "3"
      }
  };
  const encodedJson = encodeURIComponent(JSON.stringify(rawJson));
  const url = `https://graph.facebook.com/graphql?method=post&locale=en_US&pretty=false&format=json&fb_api_req_friendly_name=useBillingSelfGrantManageAdAccountMutation&doc_id=24037132059206200&fb_api_caller_class=RelayModern&server_timestamps=true&variables=${encodedJson}&access_token=${access_token}`;
  try {
      const response = await fetch(url, {
          method: 'GET',
          credentials: 'include'
      });
      const data = await response.json();

      const billingWritePermission = data?.data?.grant_manage_ad_account?.ad_account?.viewer_permissions?.billing_write;

      if (billingWritePermission) {
          return { status: true, error: null };
      } else {
          return { status: false, error: data };
      }
  } catch (err) {
      return { status: false, error: err };
  }
}

function buildRequestBody(businessID) {
  return `av=${uid}&__usid=6-Tskqef5m5416h%3APskqefx164ljb2%3A1-Askqea7pchdsm-RV%3D6%3AF%3D&__aaid=${businessID}&__user=${uid}&__a=1&__req=88&__hs=19998.BP%3Aads_manager_pkg.2.0..0.0&dpr=1&__ccg=UNKNOWN&__rev=1016987598&__s=z2tt9o%3Alkfjeh%3A8vmk3x&__hsi=7421175297378821716&__dyn=7AgSXgWGgWEjgDBxmSudg9omoiyoK6FVpkihG5Xx2m2q3K2KmeGqKi5axeqaScCCG225pojACjyocuF98SmqnK7GzUuwDxq4EOezoK26UKbC-mdwTxOESegGbwgEmK9y8Gdz8hyUuxqt1eiUO4EgCyku4oS4EWfGUhwyg9p44889EScxyu6UGq13yHGmmUTxJe9LgbeWG9DDl0zlBwyzp8KUV2U8oK1IxO4VAcKmieyp8BlBUK2O4UOi3Kdx29wgojKbUO1Wxu4GBwkEuz478shECumbz8KiewwBK68eF9UhK1vDyojyUix92UtgKi3a6Ex0RyQcKazQ3G5EbpEtzA6Sax248GUgz98hAy8tKU-4U-UG7F8a898vhojCx6EO489UW5ohwZAxK4U-dwMxeayEiwAgCmq6UCQubxu3ydDxG8wRyK4UoLzokGp5yrz8C9wFjQfyoaoym9yA4Ekx24oK4Ehzawwy9pEHyU8Uiwg8KawrVV-i782bByUeoQwox3UO364GJe2q3KfzFLxny9onxDwBwXx67HxtBxO64uWg-26q2au5onADzEHDUyEkjByo4a9AwHxq5kiUarx5e8wAAAVQEhyeucyEy3aQ48B5wPDBw&__csr=&__comet_req=25&fb_dtsg=${fb_dtsg2}&jazoest=25353&lsd=_dtDtv84z9OIgGn5IXOdW2&__spin_r=1016987598&__spin_b=trunk&__spin_t=1727877021&__jssesw=1&qpl_active_flow_ids=270206671%2C270211726%2C270213183&fb_api_caller_class=RelayModern&fb_api_req_friendly_name=useBillingReactivateAdAccountMutation&variables=%7B%22input%22%3A%7B%22billable_account_payment_legacy_account_id%22%3A%22${businessID}%22%2C%22logging_data%22%3A%7B%22logging_counter%22%3A22%2C%22logging_id%22%3A%22559255213%22%7D%2C%22upl_logging_data%22%3A%7B%22context%22%3A%22billingaccountinfo%22%2C%22entry_point%22%3A%22power_editor%22%2C%22external_flow_id%22%3A%22%22%2C%22target_name%22%3A%22BillingReactivateAdAccountMutation%22%2C%22user_session_id%22%3A%22upl_1727876994352_7d1de259-07b1-4107-8ddf-e616f492eac6%22%2C%22wizard_config_name%22%3A%22REACTIVATE_AD_ACCOUNT%22%2C%22wizard_name%22%3A%22REACTIVATE_AD_ACCOUNT%22%2C%22wizard_screen_name%22%3A%22reactivate_ad_account_state_display%22%2C%22wizard_session_id%22%3A%22upl_wizard_1727876994352_902bd8bd-c035-4924-9f33-94b00c9a5b20%22%2C%22wizard_state_name%22%3A%22reactivate_ad_account_state_display%22%7D%2C%22actor_id%22%3A%22${uid}%22%2C%22client_mutation_id%22%3A%227%22%7D%7D&server_timestamps=true&doc_id=9984888131552276&fb_api_analytics_tags=%5B%22qpl_active_flow_ids%3D270206671%2C270211726%2C270213183%22%5D`;
}

function delayMs(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}