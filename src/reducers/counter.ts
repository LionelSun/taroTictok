import { GETLIST, LIKE, GETCOMMENT, COMMENT } from "../constants/counter";

const INITIAL_STATE = {
  pageNum: 1,
  haveMore: true,
  homeList: [] as any,
  commetList: [],
};

export default function counter(state = INITIAL_STATE, action) {
  switch (action.type) {
    case GETLIST:
      if (action.data.data.length === 0) {
        return {
          ...state,
          haveMore: false,
        };
      }
      let newList = [...state.homeList, ...action.data.data];
      return {
        ...state,
        homeList: newList,
        pageNum: (state.pageNum += 1),
      };
    case LIKE:
      let homeList = [...state.homeList];
      let actionItem = homeList.find((i) => action.data.id === i.id);
      actionItem.likeState = !actionItem.likeState;
      return {
        ...state,
        homeList,
      };
    case GETCOMMENT:
      return {
        ...state,
        // comment:
      };
    default:
      return state;
  }
}
