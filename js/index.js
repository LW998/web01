let loadRender = (function () {
    let $loadingBox = $('.loadingBox'),
        $current = $loadingBox.find('.current');
    let imgData = ["img/icon.png", "img/zf_concatAddress.png", "img/zf_concatInfo.png", "img/zf_concatPhone.png", "img/zf_course.png", "img/zf_course1.png", "img/zf_course2.png", "img/zf_course3.png", "img/zf_course4.png", "img/zf_course5.png", "img/zf_course6.png", "img/zf_cube1.png", "img/zf_cube2.png", "img/zf_cube3.png", "img/zf_cube4.png", "img/zf_cube5.png", "img/zf_cube6.png", "img/zf_cubeBg.jpg", "img/zf_cubeTip.png", "img/zf_emploment.png", "img/zf_messageArrow1.png", "img/zf_messageArrow2.png", "img/zf_messageChat.png", "img/zf_messageKeyboard.png", "img/2.jpg", "img/1.jpg", "img/zf_outline.png", "img/zf_phoneBg.jpg", "img/zf_phoneDetail.png", "img/zf_phoneListen.png", "img/zf_phoneLogo.png", "img/zf_return.png"];

    let n = 0,
        len = imgData.length;
    //预加载图片
    function run(callback) {
        imgData.forEach(item => {
            let tempImg = new Image;
            tempImg.onload = () => {
                tempImg = null;
                $current.css('width', ((++n) / len) * 100 + '%');
                //加载完成(让当前load页面消失)
                if (n === len) {
                    //如果正常加载完清除定时器
                    clearTimeout(delayTimer);
                    callback && callback();
                }
            };
            tempImg.src = item;
        });
    }
    let delayTimer = null;
    //最大等待时间(到达5s我们看加载了多少了，如果到90%以上了，我们可以正常访问内容了，如果不足这个比例，直接提示用户当前网络不佳，稍后重试)
    function maxDelay(callback) {
        delayTimer = setTimeout(() => {
            if (n / len >= 0.9) {
                $current.css('width', '100%');
                callback && callback();
                return;
            } else {
                alert('当前网络状态不佳，请稍后重试');
                //此时不应该继续加载图片，而是让他跳转到另外一个页面
                window.location.href = "http://www.baidu.com"
            }
        }, 50000)
    }
    //完成后要做的事
    function done() {
        //停留一秒再移除让用户看到加载完成的页面
        let timer = setTimeout(() => {
            $loadingBox.remove();
            clearTimeout(timer);
            phoneRender.init();
        }, 1000);
    }
    return {
        init() {
            $loadingBox.css('display', 'block');
            run(done);
            maxDelay(done);
        }
    }
})();
// loadRender.init();
let phoneRender = (function () {
    let $phoneBox = $('.phoneBox'),
        $time = $phoneBox.find('span'),
        $answer = $phoneBox.find('.answer'),
        $answerMarkLink = $answer.find('.markLink'),
        $hang = $phoneBox.find('.hang'),
        $hangMarkLink = $hang.find('.markLink'),
        answerBell = $('#answerBell')[0],
        introduction = $('#introduction')[0];

    let answerMarkTouch = function answerMarkTouch() {
        $answer.remove();
        answerBell.pause();
        $(answerBell).remove();
        $hang.css('transform', 'translateY(0rem)');
        $time.css('display', 'block');
        introduction.play();
        introduction.volume = 0.3;
        computedTime();
    }
    let autoTimer = null;
    let computedTime = function computedTime() {
        let duration = 0;
        //首先会去加载资源，部分资源加载完成才会播放，才能计算出duration
        introduction.oncanplay = function () {
            duration = introduction.duration;
        }
        let autoTimer = setInterval(() => {
            let val = introduction.currentTime;
            //播放完成
            if (val >= duration) {
                clearInterval(autoTimer);
                closePhone();
                return;
            }
            let minute = Math.floor(val / 60),
                second = Math.floor(val - minute * 60) + 1;
            minute = minute < 10 ? '0' + minute : minute;
            second = second < 10 ? '0' + second : second;
            $time.html(`${minute}:${second}`);
        }, 1000);

    }
    let closePhone = function closePhone() {
        clearInterval(autoTimer);
        introduction.pause();
        $(introduction).remove();
        $phoneBox.remove();

        messageRender.init();
    }

    return {
        init() {
            $phoneBox.css('display', 'block');
            answerBell.play();
            answerBell.volume = 0.3;
            $answerMarkLink.tap(answerMarkTouch);
            $hangMarkLink.tap(closePhone);
        }
    }
})();

let messageRender = (function () {
    let $messageBox = $('.messageBox'),
        $wrapper = $messageBox.find('.wrapper'),
        $messageList = $wrapper.find('li'),
        $keyBoard = $messageBox.find('.keyBoard'),
        $textInp = $keyBoard.find('span'),
        $submit = $keyBoard.find('.submit'),
        demonMusic = $('#demonMusic')[0];
    let step = -1,
        total = $messageList.length,
        autoTimer = null,
        interval = 2000; //=>记录多久出来一条，信息出现间隔时间
    //手动发送
    let handleSend = function handleSend() {
        //transitionend监听当前元素transition动画结束(并且有几个样式属性发生了动画效果就执行几次)
        //用one方法触发可以让他只执行一次
        $keyBoard.css('transform', 'translateY(0rem)').one('transitionend', () => {
            let str = '好的，马上介绍！',
                n = -1;
            textTimer = null;
            textTimer = setInterval(() => {
                let originHtml = $textInp.html();
                $textInp.html(originHtml + str[++n]);
                if (n >= str.length - 1) {
                    clearInterval(textTimer);
                    $submit.css('display', 'block');
                }
            }, 100);
        });
    };
    let handleSubmit = function handleSubmit() {
        $(` <li class="self">
        <i class="arrow"></i>
        <img src="img/1.jpg" alt="" class="pic">
        ${$textInp.html()}
    </li>`).insertAfter($messageList.eq(1)).addClass('active');
        //把新的li放到页面中，我们应该重新获取LI，方便索引对应
        $messageList = $wrapper.find('li');
        //让键盘消失
        $textInp.html('');
        $submit.css('display', 'none');
        $keyBoard.css('transform', 'translateY(3.7rem)');
        autoTimer = setInterval(showMessage, interval);
    }

    let tt = 0;
    let showMessage = function showMessage() {
        step++;
        if (step === 2) {
            clearInterval(autoTimer);
            handleSend();
            return;
        }
        let $cur = $messageList.eq(step);
        $cur.addClass('active');
        // if (step >= 3) {
        //     let curH = $cur[0].offsetHeight,
        //         wraT = parseFloat($wrapper.css('top'));
        //     $wrapper.css('top', wraT - curH);
        //     // let curH = $cur[0].offsetHeight;
        //     // tt -= curH;
        //     // $wrapper.css('transform', `translateY(${tt}px)`)
        // }
        let curH = $cur[0].offsetTop + $cur[0].offsetHeight + 70,
            messH = parseFloat($messageBox.css('height'));
        if (curH >= messH) {
            $wrapper.css('top', messH - curH);
        }
        if (step >= total) {
            clearInterval(autoTimer);
            closeMessage();
        };

    }
    //关闭mess区
    let closeMessage = function closeMessage() {
        let delayTimer = setTimeout(() => {
            demonMusic.pause();
            $(demonMusic).remove();
            $messageBox.remove();
            clearTimeout(delayTimer);
            cubeRender.init();
        }, 2000);
    }

    return {
        init() {
            $messageBox.css('display', 'block');
            showMessage();
            autoTimer = setInterval(showMessage, interval);
            $submit.tap(handleSubmit);
            demonMusic.play();
            demonMusic.volume = 0.3;
        }
    }
})();

let cubeRender = (function () {
    let $cubeBox = $('.cubeBox'),
        $cube = $('.cube'),
        $cubeList = $cube.find('li');

    function start(ev) {
        //=>记录手指按下位置的起始坐标
        let point = ev.changedTouches[0];
        this.startX = point.clientX;
        this.startY = point.clientY;
        this.changeX = 0;
        this.changeY = 0;
    }

    function move(ev) {
        let point = ev.changedTouches[0];
        //=>用最新手指的位置减去起始的位置，记录XY轴的偏移
        this.changeX = point.clientX - this.startX;
        this.changeY = point.clientY - this.startY;

    }

    function end(ev) {
        //获取change值/rotate值
        let {
            changeX,
            changeY,
            rotateX,
            rotateY
        } = this;
        isMove = false;
        //验证是否发生移动
        Math.abs(changeX) > 10 || Math.abs(changeY) > 10 ? isMove = true : null;
        if (isMove) {
            //左右滑动=>changeX=rotateY(正比)
            //上下滑动=>changeY=rotateX(反比)
            //为了旋转角度小点，我们把移动距离的1/3作为旋转的角度
            rotateX = rotateX - changeY / 3;
            rotateY = rotateY + changeX / 3;
            $(this).css('transform', `scale(0.6) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`);
            //=>让当前旋转的角度成为下一次起始角度
            this.rotateX = rotateX;
            this.rotateY = rotateY;
        }
        //清空其他的自定义属性值
        ['startX', 'startY', 'changeX', 'changeY'].forEach(item => this[item] = null)
    }
    return {
        init(index = 0) {
            $cubeBox.css('display', 'block');
            //记录初始的选择角度，存储到自定义属性上
            let cube = $cube[0];
            cube.rotateX = -35;
            cube.rotateY = 35;
            $cube.on('touchstart', start).on('touchmove', move).on('touchend', end);
            $cubeList.tap(function () {
                $cubeBox.css('display', 'none');
                let index = $(this).index();
                detailRender.init(index);
            })
        }
    }
})();

/*DETAIL*/
let detailRender = (function () {
    let $detailBox = $('.detailBox'),
        swiper = null,
        $dl = $('.page1>dl'),
        $retList = $('.ret');

    let swiperInit = function swiperInit() {
        swiper = new Swiper('.swiper-container', {
            effect: 'coverflow',
            onInit: move,
            onTransitionEnd: move
        });
    };
    let move = function move(swiper) {
        //=>SWIPER:当前创建的实例
        //1.判断当前是否为第一个SLIDE:如果是让3D菜单展开,不是收起3D菜单
        let activeIn = swiper.activeIndex,
            slideAry = swiper.slides;
        if (activeIn === 0) {
            //=>PAGE1
            $dl.makisu({
                selector: 'dd',
                overlap: 0.6,
                speed: 0.8
            });
            $dl.makisu('open');
        } else {
            //=>OTHER PAGE
            $dl.makisu({
                selector: 'dd',
                speed: 0
            });
            $dl.makisu('close');
        }

        //2.滑动到哪一个页面，把当前页面设置对应的ID，其余页面移除ID即可
        slideAry.forEach((item, index) => {
            if (activeIn === index) {
                item.id = `page${index + 1}`;
                return;
            }
            item.id = null;
        });
        $retList.forEach((item, index) => {
            if (activeIn === index) {
                $(item).tap(function () {
                    $detailBox.css('display', 'none');
                    cubeRender.init(index);
                })
            }
        })
    };

    return {
        init: function (index = 0) {
            $detailBox.css('display', 'block');
            if (!swiper) {
                //=>防止重复初始化
                swiperInit();
            }
            swiper.slideTo(index, 0); //=>直接运动到具体的SLIDE页面(第二个参数是切换的速度：0立即切换没有切换的动画效果)
        }
    }
})();

/*以后在真实的项目中，如果页面中有滑动的需求，我们一定要把DOCUMENT
本身滑动的默认行为阻止掉（不阻止：浏览器中预览，会触发下拉刷新或者左右滑动切换页卡等功能）*/
$(document).on('touchstart touchmove touchend', (ev) => {
    ev.preventDefault();
});


let url = window.location.href,
    // hash = /#([^?=&#]+)/.exec(url)[1];
    well = url.indexOf('#'),
    hash = well === -1 ? null : url.substring(well + 1);
switch (hash) {
    case 'loading':
        loadRender.init();
        break;
    case 'phone':
        phoneRender.init();
        break;
    case 'message':
        messageRender.init();
        break;
    case 'cube':
        cubeRender.init();
        break;
    case 'detail':
        detailRender.init();
        break;
    default:
        loadRender.init();
}
