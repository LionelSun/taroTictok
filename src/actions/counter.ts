import { GETLIST, LIKE, GETCOMMENT, COMMENT } from "../constants/counter";
import { homeList } from "../service/data";

// 异步的action
export const getList = (state: any) => ({ type: GETLIST, data:  homeList(state.pageNum) }); //列表
export const like = (state: any) => ({ type: LIKE, data: state }); //喜欢
export const getComment = (state: any) => ({ type: GETCOMMENT, data: state }); //评论
export const comment = (state: any) => ({ type: COMMENT, data:state }); //评论列表
