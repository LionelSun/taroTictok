import { useState, memo, useEffect } from "react";
import { View, Swiper, SwiperItem, Video, Text } from "@tarojs/components";
import { createVideoContext } from "@tarojs/taro";
import { AtProgress, AtCurtain } from "taro-ui";

import "taro-ui/dist/style/components/progress.scss";
import "taro-ui/dist/style/components/curtain.scss";
import "./videoScroll.less";

type propType = {
  dataScore: object[];
  onChange: Function;
  autoPlayError: Function;
};
interface VideoScroll {
  props: propType;
}

declare const WeixinJSBridge: any;
declare const window: Window & { WeixinJSBridge: any; WVJBCallbacks: any };

const VideoScroll = memo((props: propType) => {
  const [current, setCurrent] = useState<number>(0);                  //视频下标
  const [curtain, setCurtain] = useState<boolean>(false);             //显示幕帘
  const [paused, setPaused] = useState<boolean>(true);                //当前视频播放状态
  const [progress, setProgress] = useState<string>("0%");             //当前视频进度跳

  const datas = {
    indicatorDots: false,
    circular: false,
    vertical: true,
    autoplay: false,
  };

  // useEffect(() => {
  // }, [current, props.dataScore, getVideoContext]);

  /**
   * 视频切换
   * @param event
   * 停止上一个视频播放
   * 播放当前视频
   */
  const swiperChange = (e: any | undefined) => {
    let vCurrent = 0;
    if (e.detail) vCurrent = e.detail.current;
    props.onChange(vCurrent);
    let videoContext = getVideoContext(vCurrent, 1); //当前视频上下文
    //暂停上一条
    if (vCurrent !== 0) {
      let videoContextPrev = getVideoContext(current, 2); //上一个视频上下文
      //停止上一条视频播放/加载
      if (vCurrent != current) {
        if (process.env.TARO_ENV === "h5") {
          videoContextPrev.pause();
        } else {
          videoContextPrev.stop();
        }
      }
    }
    //播放
    if (process.env.TARO_ENV === "h5") {
      h5VideoAutoPlay(videoContext);
    } else {
      videoContext.play();
    }
    setProgress("0%")
    setCurrent(vCurrent)
    setPaused(true)
  };

  /**
   * 获取视频上下文
   * @param vdom 当前视频index
   * @param vstate 视频播放状态 2停止 1播放
   * @returns
   */
  const getVideoContext = (vdom, vstate) => {
    let videoContext;
    if (process.env.TARO_ENV === "h5") {
      videoContext = document
        .getElementById("id" + vdom)
        ?.getElementsByTagName("video")[0];
      //播放前添加属性（防止安卓微信h5环境下，视频脱离文档流）x5-video-player-type='h5-page'
      // videoContext.setAttribute('x5-video-player-type', 'h5-page');
    } else {
      videoContext = createVideoContext("id" + vdom);
    }
    if (vstate === 2) {
      videoContext.currentTime = 0;
    }
    return videoContext;
  };

  /**
   * h5环境自动播放
   */
  const h5VideoAutoPlay = (videoContext) => {
    let user = navigator.userAgent.toLowerCase();
    //判断微信环境
    if (user.match(/MicroMessenger/i)?.toLocaleString() == "micromessenger") {
      if (window.WeixinJSBridge) {
        WeixinJSBridge.invoke(
          "getNetworkType",
          {},
          function () {
            videoContext.play();
          },
          false
        );
      } else {
        document.addEventListener(
          "WeixinJSBridgeReady",
          function () {
            WeixinJSBridge.invoke("getNetworkType", {}, function () {
              videoContext.play();
            });
          },
          false
        );
      }
    }
    videoContext.play();
    if (videoContext.paused) {
      setCurtain(true);
      setPaused(false)
    }
    //安卓正常情况下无法主动触发播放，应弹出幕帘关闭事件加入点击播放
    setTimeout(() => {}, 300);
  };

  //视频进度条方法
  const onProgress = (e) => {
    let ps = GetPercent(e.detail.currentTime, e.detail.duration);
    setProgress(ps);
  };

  //计算百分比
  const GetPercent = (num, total) => {
    num = parseFloat(num);
    total = parseFloat(total);
    if (Number.isNaN(num) || Number.isNaN(total)) {
      return "-";
    }
    return total <= 0 ? "0%" : Math.round((num / total) * 10000) / 100.0 + "%";
  };

  //初始化自动播放
  const InitPlayFunc = () => {
    //小程序环境可直接播放视频
    if (process.env.TARO_ENV !== "h5") {
      createVideoContext("id0").play();
    } else {
      //h5尝试通过微信方法触发(IOS可以播放，安卓失效)
      setTimeout(() => {
        let videoContext = getVideoContext(0, 1);
        if (process.env.TARO_ENV === "h5") {
          h5VideoAutoPlay(videoContext);
        }
      }, 600);
    }
    // this.editPlayed()
  };

  //单击暂停/播放
  const touchv = () => {
    let videoContext = getVideoContext(current, 1);
    if (!paused) {
      videoContext.play();
    } else {
      videoContext.pause();
    }
    setPaused(!paused);
  };

  useEffect(() => {
    InitPlayFunc();
  }, []);

  return (
    <View>
      <Swiper
        className='videoMain'
        disableTouch
        current={current}
        vertical={datas.vertical}
        circular={datas.circular}
        indicatorDots={datas.indicatorDots}
        onChange={swiperChange}
        key={props.dataScore.length.toLocaleString()}
      >
        {props.dataScore.map((item: any, index: number) => (
          <SwiperItem
            key={item.id}
            className='SwiperItem'
            id={`swi_${item.id}`}
            onClick={touchv}
          >
            <View className='videoCtrl'>
              <View className='info'>
                <Text className='userName'>@ {item.title}</Text>
                <Text className='videoTitle'>{item.desc}</Text>
              </View>
              <AtProgress
                percent={parseFloat(progress)}
                isHidePercent
                className='TimeUp'
              />
            </View>
            {current === index ||
            current - index === 1 ||
            current - index === -1 ? (
              <Video
                src={item.vUrl}
                poster={`${item.vUrl}?vframe/jpg/offset/1`}
                showCenterPlayBtn={false}
                showPlayBtn={false}
                showFullscreenBtn={false}
                showProgress={false}
                objectFit='cover'
                controls
                loop
                onTimeUpdate={onProgress}
                x5-video-player-type='h5-page'
                webkit-playsinline='true'
                x5-playsinline='true'
                x5-video-orientation='portraint'
                className='video'
                id={`id${index}`}
              ></Video>
            ) : (
              ""
            )}
          </SwiperItem>
        ))}
      </Swiper>
      <View>
        <AtCurtain
          isOpened={curtain}
          onClose={() => {
            setCurtain(false);
            touchv();
          }}
        ></AtCurtain>
      </View>
    </View>
  );
});

export { VideoScroll };
