Vue.createApp({
    data() {
        return {
            screenSize: 'minimized'
        }
    },
    created() {
        window.addEventListener("resize", this.onResize);
    },
    destroyed() {
        window.removeEventListener("resize", this.onResize);
    },
    methods: {
        changeSize() {
            this.screenSize = this.screenSize == 'minimized' ? 'fullScreen' : 'minimized';
            if (this.screenSize == 'fullScreen') {
                document.getElementById('gc').width = document.documentElement.clientWidth;
                document.getElementById('gc').height = document.documentElement.clientHeight;
            } else {
                document.getElementById('gc').width = 400;
                document.getElementById('gc').height = 400;
            }
        },
        onResize(e) {
            if (this.screenSize == 'fullScreen') {
                document.getElementById('gc').width = document.documentElement.clientWidth;
                document.getElementById('gc').height = document.documentElement.clientHeight;
            }
        },
        iconVisibility(e) {
            if (e == this.screenSize) {
                return 'visible';
            }
            return 'invisible';
        }
    }
}).mount('#app');