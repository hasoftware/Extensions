# Facebook Ads API Documentation

## Tài liệu API cho Quản lý Tài khoản Quảng cáo Facebook

### 📋 Lấy Danh Sách Tài Khoản Quảng Cáo (fetchAdAccounts)

#### **Endpoint:**

```
https://graph.facebook.com/v19.0/{user_id}/adaccounts
```

#### **Method:**

```
GET
```

#### **Parameters:**

- `access_token=${access_token}`
- `pretty=1`
- `fields=account_status,created_time,owner,owner_business,name,adtrust_dsl,currency,userpermissions.user(${uid})%7Brole%7D`
- `limit=300`

#### **Fields Description:**

- `account_status`: Trạng thái tài khoản (100=active, 101=disabled, etc.)
- `created_time`: Thời gian tạo tài khoản
- `owner`: ID chủ sở hữu tài khoản
- `owner_business`: ID Business Manager sở hữu (null nếu là tài khoản cá nhân)
- `name`: Tên tài khoản quảng cáo
- `adtrust_dsl`: Data Sharing Level
- `currency`: Đơn vị tiền tệ
- `userpermissions.user(${uid}){role}`: Quyền của user hiện tại

#### **Response Success:**

```json
{
  "data": [
    {
      "id": "act_123456789",
      "account_status": 100,
      "created_time": "2023-01-01T00:00:00+0000",
      "owner": "123456789",
      "owner_business": null,
      "name": "Tài khoản quảng cáo",
      "adtrust_dsl": 1,
      "currency": "VND",
      "userpermissions": {
        "data": [
          {
            "role": "ADMIN"
          }
        ]
      }
    }
  ],
  "paging": {
    "cursors": {
      "before": "cursor_before",
      "after": "cursor_after"
    },
    "next": "https://graph.facebook.com/v19.0/..."
  }
}
```

#### **Code Implementation:**

```javascript
async function fetchAdAccounts() {
  let allAccounts = [];
  let url = `https://graph.facebook.com/v19.0/${uid}/adaccounts?access_token=${access_token}&pretty=1&fields=account_status,created_time,owner,owner_business,name,adtrust_dsl,currency,userpermissions.user(${uid})%7Brole%7D&limit=300`;
  let loadCount = 0;

  try {
    while (url) {
      loadCount++;
      console.log(`🔄 Đang tải lần ${loadCount} (tối đa 300 tài khoản/lần)...`);
      const response = await fetch(url, {
        method: "GET",
        credentials: "include",
      });
      const data = await response.json();

      if (data && data.data) {
        // Lọc chỉ lấy tài khoản không thuộc Business Manager
        const filtered = data.data.filter((item) => !item.owner_business);
        allAccounts = allAccounts.concat(filtered);
      }

      // Phân trang - lấy URL trang tiếp theo
      url = data && data.paging && data.paging.next ? data.paging.next : null;
    }

    console.log(`📊 Tổng số tài khoản: ${allAccounts.length}`);
    console.log(
      "🆔 Danh sách ID:\n" +
        allAccounts
          .map(
            (item) =>
              `${item.id.replace("act_", "")}|${item.adtrust_dsl} ${
                item.currency
              }|(${item.account_status})${item.name}|${item.created_time}`
          )
          .join("\n")
    );

    return { success: true, data: allAccounts };
  } catch (error) {
    return { success: false, error };
  }
}
```

#### **Cách Sử Dụng:**

```javascript
const { success, data, error } = await fetchAdAccounts();
if (success) {
  console.log(`Tìm thấy ${data.length} tài khoản quảng cáo`);
  data.forEach((account) => {
    console.log(
      `ID: ${account.id}, Tên: ${account.name}, Trạng thái: ${account.account_status}`
    );
  });
} else {
  console.log("❌ Lỗi:", error);
}
```

#### **Lưu Ý:**

- **Phân trang tự động**: Hàm tự động xử lý phân trang
- **Lọc Business Manager**: Chỉ lấy tài khoản cá nhân
- **Rate limiting**: Nên có delay giữa các request
- **Quyền truy cập**: Cần có quyền xem tài khoản quảng cáo

---

### 🔐 Thêm Quyền Quản Lý (addpermission)

#### **Endpoint:**

```
https://graph.facebook.com/graphql
```

#### **Method:**

```
GET
```

#### **Parameters:**

- `method=post`
- `locale=en_US`
- `pretty=false`
- `format=json`
- `fb_api_req_friendly_name=useBillingSelfGrantManageAdAccountMutation`
- `doc_id=24037132059206200`
- `fb_api_caller_class=RelayModern`
- `server_timestamps=true`
- `variables=${encodedJson}`
- `access_token=${accessToken}`

#### **Request Body (JSON):**

```json
{
  "input": {
    "business_id": "BUSINESS_ID",
    "payment_legacy_account_id": "AD_ACCOUNT_ID",
    "actor_id": "USER_ID",
    "client_mutation_id": "3"
  }
}
```

#### **Response Success:**

```json
{
  "data": {
    "grant_manage_ad_account": {
      "ad_account": {
        "viewer_permissions": {
          "billing_write": true
        }
      }
    }
  }
}
```

#### **Code Implementation:**

```javascript
async function addpermission(adAccountId) {
  const rawJson = {
    input: {
      business_id: businessId,
      payment_legacy_account_id: adAccountId,
      actor_id: actorId,
      client_mutation_id: "3",
    },
  };
  const encodedJson = encodeURIComponent(JSON.stringify(rawJson));
  const url = `https://graph.facebook.com/graphql?method=post&locale=en_US&pretty=false&format=json&fb_api_req_friendly_name=useBillingSelfGrantManageAdAccountMutation&doc_id=24037132059206200&fb_api_caller_class=RelayModern&server_timestamps=true&variables=${encodedJson}&access_token=${accessToken}`;

  try {
    const response = await fetch(url, {
      method: "GET",
      credentials: "include",
    });
    const data = await response.json();

    const billingWritePermission =
      data?.data?.grant_manage_ad_account?.ad_account?.viewer_permissions
        ?.billing_write;

    if (billingWritePermission) {
      return { status: true, error: null };
    } else {
      return { status: false, error: data };
    }
  } catch (err) {
    return { status: false, error: err };
  }
}
```

---

### 🏷️ Đổi Tên Tài Khoản Quảng Cáo (renameAds)

#### **Endpoint:**

```
https://graph.facebook.com/graphql
```

#### **Method:**

```
GET
```

#### **Parameters:**

- `method=post`
- `locale=en_US`
- `pretty=false`
- `format=json`
- `fb_api_req_friendly_name=BizKitSettingsUpdateAdAccountMutation`
- `doc_id=9529710170410943`
- `fb_api_caller_class=RelayModern`
- `server_timestamps=true`
- `variables=${encodedJson}`
- `access_token=${accessToken}`

#### **Request Body (JSON):**

```json
{
  "adAccountID": "AD_ACCOUNT_ID",
  "adAccountName": "NEW_ACCOUNT_NAME",
  "endAdvertiserID": null
}
```

#### **Response Success:**

```json
{
  "data": {
    "business_settings_update_ad_account": {
      "business_object_name": "NEW_ACCOUNT_NAME"
    }
  }
}
```

#### **Code Implementation:**

```javascript
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
      method: "GET",
      credentials: "include",
    });
    const data = await response.json();

    const updatedName =
      data?.data?.business_settings_update_ad_account?.business_object_name;

    if (updatedName === newName) {
      return { status: true, error: null };
    } else {
      return { status: false, error: data };
    }
  } catch (err) {
    return { status: false, error: err };
  }
}
```

---

### 🔑 Thông Tin Xác Thực Cần Thiết

#### **Access Token:**

```javascript
const accessToken = require("WebApiApplication").getAccessToken();
```

#### **User ID:**

```javascript
const actorId = require("CurrentUserInitialData").USER_ID;
```

#### **Business ID:**

```javascript
const businessId = require("BusinessUnifiedNavigationContext").businessID;
```

#### **FB DTSG Token:**

```javascript
const fb_dtsgg = require("DTSGInitData").token;
```

---

### 📋 Các Tham Số Quan Trọng

#### **GraphQL Document IDs:**

- **Lấy danh sách tài khoản:** Không cần (REST API)
- **Thêm quyền:** `24037132059206200`
- **Đổi tên:** `9529710170410943`

#### **API Friendly Names:**

- **Lấy danh sách tài khoản:** Không cần (REST API)
- **Thêm quyền:** `useBillingSelfGrantManageAdAccountMutation`
- **Đổi tên:** `BizKitSettingsUpdateAdAccountMutation`

#### **Client Mutation IDs:**

- **Lấy danh sách tài khoản:** Không cần
- **Thêm quyền:** `"3"`
- **Đổi tên:** Không cần

#### **API Endpoints:**

- **Lấy danh sách tài khoản:** `https://graph.facebook.com/v19.0/{user_id}/adaccounts`
- **Thêm quyền:** `https://graph.facebook.com/graphql`
- **Đổi tên:** `https://graph.facebook.com/graphql`

#### **Account Status Codes:**

- `100`: Active (Hoạt động)
- `101`: Disabled (Vô hiệu hóa)
- `2`: Disabled (Vô hiệu hóa)
- `7`: Pending Risk Review (Chờ xem xét rủi ro)
- `9`: Pending Settlement (Chờ thanh toán)
- `100`: Active (Hoạt động)

---

### ⚠️ Lưu Ý Quan Trọng

1. **Quyền truy cập:** Cần có quyền admin trên Business Manager
2. **Rate Limiting:** Nên có delay giữa các request
3. **Error Handling:** Luôn kiểm tra response status
4. **Security:** Không chia sẻ access token
5. **Testing:** Test trên tài khoản nhỏ trước

---

### 🚀 Cách Sử Dụng

```javascript
// Lấy danh sách tài khoản quảng cáo
const { success, data, error } = await fetchAdAccounts();
if (success) {
  console.log(`✅ Tìm thấy ${data.length} tài khoản quảng cáo`);
  data.forEach((account) => {
    console.log(
      `ID: ${account.id}, Tên: ${account.name}, Trạng thái: ${account.account_status}`
    );
  });
} else {
  console.log("❌ Lỗi:", error);
}

// Thêm quyền
const permissionResult = await addpermission("act_123456789");
if (permissionResult.status) {
  console.log("✅ Thêm quyền thành công");
} else {
  console.log("❌ Lỗi:", permissionResult.error);
}

// Đổi tên
const renameResult = await renameAds("act_123456789", "Tên Mới");
if (renameResult.status) {
  console.log("✅ Đổi tên thành công");
} else {
  console.log("❌ Lỗi:", renameResult.error);
}
```

---

_Tài liệu được tạo bởi maxvia88.com - Ads solution_
