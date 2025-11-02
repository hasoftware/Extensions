// CODE TÁCH ADS WHATSAPP
const accountLists = `888888888888`; //Bạn có thể nhập nhiều tài khoản quảng cáo, mỗi tài khoản trên một dòng



var doAddPeople = true; // Bạn có muốn Thêm Quyền trước khi tách không?
var renameads = true; // Bạn có muốn đổi tên sau khi tách?
var activeAds = true; // Bạn có muốn active lại tkqc sau khi tách?
const NameTKQC ='BAN DO'; // Tên tài khoản quảng cáo sau khi tách

const delays =  +prompt("⏱️Thời gian delay giữa các lần xử lý (s):") || 1;
const accountIds = accountLists.split('\n').filter(id => id.trim() !== '');
const actorId = require("CurrentUserInitialData").USER_ID;
const businessId = require("BusinessUnifiedNavigationContext").businessID;
const fb_dtsgg = require("DTSGInitData").token;
const accessToken = require("WebApiApplication").getAccessToken();

async function addpermission(adAccountId) {
    const rawJson = {
        input: {
            business_id: businessId,
            payment_legacy_account_id: adAccountId,
            actor_id: actorId,
            client_mutation_id: "3"
        }
    };
    const encodedJson = encodeURIComponent(JSON.stringify(rawJson));
    const url = `https://graph.facebook.com/graphql?method=post&locale=en_US&pretty=false&format=json&fb_api_req_friendly_name=useBillingSelfGrantManageAdAccountMutation&doc_id=24037132059206200&fb_api_caller_class=RelayModern&server_timestamps=true&variables=${encodedJson}&access_token=${accessToken}`;
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
            let errorMsg = null;
            if (Array.isArray(data.errors) && data.errors[0]?.description) {
                errorMsg = data.errors[0].description;
            } else {
                errorMsg = JSON.stringify(data);
            }
            return { status: false, error: errorMsg };
        }
    } catch (err) {
        return { status: false, error: err };
    }
}

async function CloseAdAccount(adAccountId) {

    const StringPost = `jazoest=25524&fb_dtsg=${fb_dtsgg}&account_id=${adAccountId}&__usid=6-Tskqo1h1o56glr%3APskqo1h16o00sk%3A0-Askqn631d2395g-RV%3D6%3AF%3D&__aaid=0&__bid=${businessId}&__user=${actorId}&__a=1&__req=y&__hs=19998.BP%3Abrands_pkg.2.0..0.0&dpr=1&__ccg=EXCELLENT&__rev=1016990685&__s=axc5os%3A4n4eqp%3A948yz8&__hsi=7421228722412779754&__dyn=7xeUmxa2C5rgydwCwRyUbFp4Unxim2q1Dxuq3mq1FxebzA3miidBxa7EiwnobES2S2q1Ex21FxG9y8Gdz8hw9-3a4EuCwQwCxq0yFE4WqbwQzobVqxN0Cmu3mbx-261UxO4UkK2y1gwBwXwEw-G2mcwuE2Bz84a9DxW10wywWjxCU5-u2C2l0Fg2uwEwiUmwoErorx2aK2a4p8aHwzzXx-ewjovCxeq4o884O1fwwxefzo5G4E5yeDyU52dwyw-z8c8-5aDwQwKG13y86qbxa4o-2-qaUK2e0UFU2RwrU6CiU9E4KeCK2q5UpwDwjouxK2i2y1sDw4kwtU5K2G0BE&__csr=&lsd=h2GQa8HPsn-MsvTtASY4gX&__spin_r=1016990685&__spin_b=trunk&__spin_t=1727889460&__jssesw=1`;
    const url = `https://business.facebook.com/ads/ajax/account_close`;

    try {
        const response = await fetch(url, {
            method: 'POST',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: StringPost
        });
        let text = await response.text();
        if (text.startsWith('for (;;);')) {
            text = text.slice('for (;;);'.length);
        }
        const data = JSON.parse(text);

        if (Array.isArray(data?.payload) && data.payload.length === 0 && !data.errorSummary) {
            return { status: true, error: null };
        } else {
            return { status: false, error: data.errorSummary || data};
        }
    } catch (err) {
        return { status: false, error: err };
    }
}

async function ActiveAdAccountToken(adAccountId) {
    const rawJson = {
        input: {
            billable_account_payment_legacy_account_id: adAccountId,
            logging_data: {
                logging_counter: 22,
                logging_id: "559255213"
            },
            upl_logging_data: {
                context: "billingaccountinfo",
                entry_point: "power_editor",
                external_flow_id: "",
                target_name: "BillingReactivateAdAccountMutation",
                user_session_id: "upl_1727876994352_7d1de259-07b1-4107-8ddf-e616f492eac6",
                wizard_config_name: "REACTIVATE_AD_ACCOUNT",
                wizard_name: "REACTIVATE_AD_ACCOUNT",
                wizard_screen_name: "reactivate_ad_account_state_display",
                wizard_session_id: "upl_wizard_1727876994352_902bd8bd-c035-4924-9f33-94b00c9a5b20",
                wizard_state_name: "reactivate_ad_account_state_display"
            },
            actor_id: actorId,
            client_mutation_id: "7"
        }
    };
    
    const encodedJson = encodeURIComponent(JSON.stringify(rawJson));
    const url = `https://graph.facebook.com/graphql?method=post&locale=en_US&pretty=false&format=json&fb_api_req_friendly_name=useBillingReactivateAdAccountMutation&doc_id=9984888131552276&fb_api_caller_class=RelayModern&server_timestamps=true&variables=${encodedJson}&access_token=${accessToken}`;
    try {
        const response = await fetch(url, {
            method: 'GET',
            credentials: 'include'
        });
        const data = await response.json();

        const billingWritePermission = data?.data?.reactivate_ad_account?.status === "ADMARKET_ACCOUNT_STATUS_ACTIVE";

        if (billingWritePermission) {
            return { status: true, error: null };
        } else {
            return { status: false, error: data };
        }
    } catch (err) {
        return { status: false, error: err };
    }
}

async function renameAds(adAccountId, newName) {
    const rawJson = {
        adAccountID: adAccountId,
        adAccountName: newName,
        endAdvertiserID: null,
    };

    const encodedJson = encodeURIComponent(JSON.stringify(rawJson));
    const url = `https://graph.facebook.com/graphql?method=post&locale=en_US&pretty=false&format=json&fb_api_req_friendly_name=BizKitSettingsUpdateAdAccountMutation&doc_id=9529710170410943&fb_api_caller_class=RelayModern&server_timestamps=true&variables=${encodedJson}&access_token=${accessToken}`;

    try {
        const response = await fetch(url, {
            method: 'GET',
            credentials: 'include'
        });
        const data = await response.json();

        const updatedName = data?.data?.business_settings_update_ad_account?.business_object_name;

        if (updatedName === newName) {
            return { status: true, error: null };
        } else {
            return { status: false, error: data };
        }
    } catch (err) {
        return { status: false, error: err };
    }
}


async function ActiveadsBM(adsaccountBMId) {
    const url = `https://business.facebook.com/ads/manage/unsettled.php?act=${adsaccountBMId}`;
    try {
      const response = await fetch(url, {
        method: 'GET',
        credentials: 'include',
        redirect: 'manual' 
      });

      if (response.status === 302 || response.status === 200) {
        return { status: true, error: null };
      }

    } catch (error) {

    }
    return { status: false, error: null };
}


(async () => {

    var successCount = 0;
    for (let i = 0; i < accountIds.length; i++) {
        console.group(`🔄 ${i + 1}/${accountIds.length} Process ${accountIds[i]}... [${new Date().toLocaleString()}]`);
        let canClose = true;
        let doRename = renameads;
        let doActive = activeAds;
    
        if (doAddPeople) {
            const addpermissionResult = await addpermission(accountIds[i]);
            if (addpermissionResult.status) {
                console.log(`✅ Thêm Quyền: SUCCESS`);
            } else {
                console.log(`❌ Thêm Quyền: ERROR:`, addpermissionResult.error);
                canClose = false;
                doRename = false;
                doActive = false;
            }
        }
        if (canClose) {
            const TachAds = await CloseAdAccount(accountIds[i]);
            if (TachAds.status) {
                console.log(`✅ TÁCH: SUCCESS`);
                successCount++;
            } else {
                console.log(`❌ TÁCH: ERROR:`, TachAds.error);
                doRename = false;
                doActive = false;
            }
        }

        if (doActive) {
            const activeResult = await ActiveAdAccountToken(accountIds[i]);
            if (activeResult.status) {
                console.log(`✅ ACTIVE: SUCCESS`);
            } else {
                console.log(`❌ ACTIVE: error:`, activeResult.error);
                const activeResultadsBM = await ActiveadsBM(accountIds[i]);
                if (activeResultadsBM.status) {
                    console.log(`✅ ACTIVE ADS BM: SUCCESS`);
                }else {
                    console.log(`❌ ACTIVE ADS BM: ERROR`);
                }
            }
        }
    
        if (doRename) {
            var newName = `${NameTKQC} ${successCount}`;
            const renameResult = await renameAds(accountIds[i], newName);
            if (renameResult.status) {
                console.log(`✅ Rename: SUCCESS -> ${newName}`);
            } else {
                console.log(`❌ Rename: ERROR:`, renameResult.error);
                doActive = false;
            }
        }
    


        console.groupEnd();
        console.log(`Delay ${delays} seconds...`);
        await new Promise(resolve => setTimeout(resolve, delays * 1000));
    }
    console.log(`\n✅ DONE ALL PROCESS! [${new Date().toLocaleString()}]
        💡Tổng số tài khoản đã tách: ${successCount}/${accountIds.length}
        💻 By maxvia88.com
        ✨ Follow us to get the latest updates on tutorials and tricks! 🚀📚`);
        alert(`✅Successs ${successCount}/${accountIds.length} Ads [${new Date().toLocaleString()}]`);

    window.open("https://maxvia88.com", "_blank");
})();