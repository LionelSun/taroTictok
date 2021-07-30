import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { View, Text } from "@tarojs/components";

import { VideoScroll } from "../../components/videoScroll/videoScroll";
import { getList } from "../../actions/counter";

import "./index.less";

export default () => {
  const dispatch = useDispatch();
  const pageNum = useSelector((state: any) => state.counter.pageNum);
  const homeList = useSelector((state: any) => state.counter.homeList);
  const haveMore = useSelector((state: any) => state.counter.haveMore);

  useEffect(() => {
    dispatch(getList({ pageNum }));
  }, []);

  const videoChange = (e) => {
    if (e + 1 === homeList.length && haveMore) {
      setTimeout(() => {
        dispatch(getList({ pageNum }));
      }, 100);
      console.log("getMore");
    }
  };
  return (
    <View className='index'>
      <View>
        <View className='tab_barr'>
          <Text className='tab_item_line'>首页</Text>
          <Text className='tab_item_line'>案例</Text>
          <Text className='tab_item_line'>我的</Text>
        </View>
      </View>
      <VideoScroll
        dataScore={homeList}
        onChange={(e: string | number) => videoChange(e)}
      ></VideoScroll>
    </View>
  );
};
