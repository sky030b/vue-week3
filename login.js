console.clear();
const { createApp, ref } = Vue;

const app = {
    data() {
        return {
            userData: {
                username: "",
                password: ""
            },
            api: {
                url: "https://ec-course-api.hexschool.io/v2",
                path: "sky030b"
            },
        }
    },
    methods: {
        login() {
            axios.post(`${this.api.url}/admin/signin`, this.userData)
                .then(res => {
                    const { token, expired } = res.data;
                    document.cookie = `token=${token}; expires=${new Date(expired)};`;
                    alert("登入成功。");
                    location.href = "./products.html";
                })
                .catch(err => {
                    alert(err.data.error.message);
                })
        },
    },
    mounted() {

    }
}

createApp(app).mount("#app");