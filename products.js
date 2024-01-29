console.clear();
const { createApp, ref } = Vue;

// 用來取cookies value的輔助函式
var docCookies = {
    getItem: function (sKey) {
        return (
            decodeURIComponent(
                document.cookie.replace(
                    new RegExp(
                        "(?:(?:^|.*;)\\s*" +
                        encodeURIComponent(sKey).replace(/[-.+*]/g, "\\$&") +
                        "\\s*\\=\\s*([^;]*).*$)|^.*$",
                    ),
                    "$1",
                ),
            ) || null
        );
    },
    setItem: function (sKey, sValue, vEnd, sPath, sDomain, bSecure) {
        if (!sKey || /^(?:expires|max\-age|path|domain|secure)$/i.test(sKey)) {
            return false;
        }
        var sExpires = "";
        if (vEnd) {
            switch (vEnd.constructor) {
                case Number:
                    sExpires =
                        vEnd === Infinity
                            ? "; expires=Fri, 31 Dec 9999 23:59:59 GMT"
                            : "; max-age=" + vEnd;
                    break;
                case String:
                    sExpires = "; expires=" + vEnd;
                    break;
                case Date:
                    sExpires = "; expires=" + vEnd.toUTCString();
                    break;
            }
        }
        document.cookie =
            encodeURIComponent(sKey) +
            "=" +
            encodeURIComponent(sValue) +
            sExpires +
            (sDomain ? "; domain=" + sDomain : "") +
            (sPath ? "; path=" + sPath : "") +
            (bSecure ? "; secure" : "");
        return true;
    },
    removeItem: function (sKey, sPath, sDomain) {
        if (!sKey || !this.hasItem(sKey)) {
            return false;
        }
        document.cookie =
            encodeURIComponent(sKey) +
            "=; expires=Thu, 01 Jan 1970 00:00:00 GMT" +
            (sDomain ? "; domain=" + sDomain : "") +
            (sPath ? "; path=" + sPath : "");
        return true;
    },
    hasItem: function (sKey) {
        return new RegExp(
            "(?:^|;\\s*)" +
            encodeURIComponent(sKey).replace(/[-.+*]/g, "\\$&") +
            "\\s*\\=",
        ).test(document.cookie);
    },
    keys: /* optional method: you can safely remove it! */ function () {
        var aKeys = document.cookie
            .replace(/((?:^|\s*;)[^\=]+)(?=;|$)|^\s*|\s*(?:\=[^;]*)?(?:\1|$)/g, "")
            .split(/\s*(?:\=[^;]*)?;\s*/);
        for (var nIdx = 0; nIdx < aKeys.length; nIdx++) {
            aKeys[nIdx] = decodeURIComponent(aKeys[nIdx]);
        }
        return aKeys;
    },
};

const app = {
    data() {
        return {
            api: {
                url: "https://ec-course-api.hexschool.io/v2",
                path: "sky030b"
            },
            products: {},
            productTemp: {},
            ert: {},
            deleteTemp: {},
        }
    },
    methods: {
        // api functions
        checkLogin() {
            axios.post(`${this.api.url}/api/user/check`)
                .then(res => {
                    this.getAllProducts();
                })
                .catch(err => {
                    alert(`${err.data.message}。\n將返回登入頁。`);
                    location.href = "./login.html";
                })
        },
        getAllProducts() {
            axios.get(`${this.api.url}/api/${this.api.path}/admin/products/all`)
                .then(res => {
                    this.products = res.data.products;
                })
                .catch(err => {
                    alert(`${err.data.message}\n將返回登入頁。`);
                    location.href = "./login.html";
                })
        },
        addProduct() {
            const data = {
                data: this.productTemp
            }
            axios.post(`${this.api.url}/api/${this.api.path}/admin/product/`, data)
                .then(res => {
                    alert("新增成功。")
                    this.getAllProducts();
                    this.handleModalDismiss();
                })
                .catch(err => {
                    alert(`${err.data.message}`);
                })
        },
        editProduct() {
            const data = {
                data: this.productTemp
            }
            axios.put(`${this.api.url}/api/${this.api.path}/admin/product/${this.productTemp.id}`, data)
                .then(res => {
                    alert("修改成功。")
                    this.getAllProducts();
                    this.handleModalDismiss();
                })
                .catch(err => {
                    alert(`${err.data.message}`);
                })
        },
        deleteProduct() {
            axios.delete(`${this.api.url}/api/${this.api.path}/admin/product/${this.deleteTemp.id}`)
                .then(res => {
                    alert("刪除成功。")
                    this.getAllProducts();
                    this.handleModalDismiss();
                })
                .catch(err => {
                    alert(`${err.data.message}`);
                })
        },

        // 關閉 modal 後重製兩種 temp object
        handleModalDismiss() {
            // 若 指定 modal 存在，則將之關閉
            const productModal = bootstrap.Modal.getInstance(document.querySelector("#productModal"));
            productModal ? productModal.hide() : null;
            const delProductModal = bootstrap.Modal.getInstance(document.querySelector("#delProductModal"));
            delProductModal ? delProductModal.hide() : null;

            // 這裡在處理 modal 被隱藏時的邏輯
            this.productTemp = {};
            this.deleteTemp = {};
        },
        // 開啟新增或編輯 modal 前，都先重置 productTemp(two ways)
        initProductTemp() {
            this.productTemp = {};
        },
        editProductTemp(product) {
            this.productTemp = JSON.parse(JSON.stringify(product));
        },
        // 開啟刪除 modal 前，都先重置 deleteTemp
        initDeleteTemp(product) {
            this.deleteTemp = { ...product };

            const delConfirmBtn = document.querySelector(".del-btn");
            setTimeout(() => {
                delConfirmBtn.focus();
            }, 500)
        },
        // 送出 新增 或 編輯 的產品資料
        submitAddOrEditProduct() {
            if (this.productTemp.hasOwnProperty("id")) {
                this.editProduct();
            } else {
                this.addProduct();
            }
        },

        // 新增或編輯modal中所使用的function
        changeBigImage() {
            this.productTemp.imageTempUrl ? this.productTemp.imageUrl = this.productTemp.imageTempUrl : null;
            this.productTemp.imageTempUrl = "";
        },
        removeBigImage() {
            this.productTemp.imageUrl = "";
        },
        addSmallImage() {
            if (this.productTemp.smallImageTempUrl) {
                if (this.productTemp.hasOwnProperty("imagesUrl")) {
                    this.productTemp.imagesUrl.push(this.productTemp.smallImageTempUrl);
                } else {
                    this.productTemp.imagesUrl = [this.productTemp.smallImageTempUrl];
                }
                this.productTemp.smallImageTempUrl = "";
            }
        },
        removeOneSmallImage(index) {
            this.productTemp.imagesUrl.splice(index, 1)
        },
        removeAllSmallImage() {
            this.productTemp.imagesUrl = [];
        }

    },
    mounted() {
        const token = docCookies.getItem("token");
        axios.defaults.headers.common['Authorization'] = token;

        this.checkLogin();
    }
}

Vue.createApp(app).mount("#app");
