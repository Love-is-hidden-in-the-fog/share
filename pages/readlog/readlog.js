/*
 * 
 * 雅趣·慢享小程序
 * 
 */
 
import config from '../../utils/config.js'
var Api = require('../../utils/api.js');
var util = require('../../utils/util.js');
var Auth = require('../../utils/auth.js');
var WxParse = require('../../wxParse/wxParse.js');
var wxApi = require('../../utils/wxApi.js')
var wxRequest = require('../../utils/wxRequest.js');
var app = getApp();
let  userinfo={}
Page({

  data: {    
    readLogs: [],
    topBarItems: [
        // id name selected 选中状态
        { id: '1', name: '浏览', selected: true },
        { id: '3', name: '点赞', selected: false },
        { id: '4', name: '收藏', selected: false },
        { id: '2', name: '评论', selected: false },
    ],
    tab: '1',
    showerror: "none",
    shownodata:"none",
    subscription:"",
		userInfo:{},
		avatarUrl:"../../images/gravatar.png",
		nickName:"",
    userLevel:{},
    openid:'',
    isLoginPopup: false  
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {  
    var self = this;     
    self.fetchPostsData('1');
    Auth.setUserInfoData(self); 
    Auth.checkLogin(self);
		wx.setNavigationBarTitle({
			title: config.getWebsiteName+' - 个人中心',
			success: function (res) {
					// success
			}
	});
  },

  onReady: function () {
    var self = this;   
    Auth.checkSession(self,'isLoginNow');
  },
  onChooseAvatar:function(e){
		// console.log(e)
		
		userinfo.avatarUrl=e.detail.avatarUrl
		this.setData({
			userInfo:userinfo
		})
    // Auth.checkAgreeGetUser(e,app,self,'0');        
	}, 
	getUserName(e){
		let self= this;
		userinfo.nickName=e.detail.value.nickname
		if(userinfo.nickName&&userinfo.avatarUrl){
			userinfo.isLogin = true;
			Auth.checkAgreeGetUser(e,userinfo,self,'0');  
		}else{
			console.log("请输入完整")
			wx.showToast({
				title: '请输入完整数据',
				icon:"error"
			})
		}
	},

  refresh:function(e)
  {
    var self=this;
    if (self.data.openid) {
        var args={};
        var userInfo=e.detail.userInfo;
 
        console.log(args.openid);
        console.log(args.avatarUrl);
        console.log(args.nickname);
        var url = Api.getUpdateUserInfo();        
        var postUpdateUserInfoRequest = wxRequest.postRequest(url2, args);
        postUpdateUserInfoRequest.then(res => {
            if (res.data.status == '200') {
										var userLevel= res.data.userLevel;     
										console.log(userInfo)                       
                    wx.setStorageSync('userInfo',userInfo);                           
                    wx.setStorageSync('userLevel',userLevel);                            
                    self.setData({userInfo:userInfo});
                    self.setData({userLevel:userLevel});
                    wx.showToast({
                        title: res.data.message,
                        icon: 'success',
                        duration: 900,
                        success: function () {
                        }
                    })   
            }
            else{               
                wx.showToast({
                    title: res.data.message,
                    icon: 'success',
                    duration: 900,
                    success: function () {
                    }
                })
            }        });
    }
    else {
        Auth.checkSession(self,'isLoginNow');
        
    }
           
  },

  exit:function(e)
  {
    Auth.logout(this);
    wx.reLaunch({
        url: '../index/index'
      })
  },
  clear:function(e)
  {

    Auth.logout(this); 

  },

  // 跳转至查看文章详情
  redictDetail: function (e) {
    // console.log('查看文章');
    var id = e.currentTarget.id;
    var itemtype = e.currentTarget.dataset.itemtype;
    var url ="";
    if (itemtype=="1")
    {
        url = '../list/list?categoryID=' + id;
    }
    else
    {
        url = '../detail/detail?id=' + id;
    }

    wx.navigateTo({
      url: url
    })
  },
  onTapTag: function (e) {
      var self = this;
      var tab = e.currentTarget.id;
      var topBarItems = self.data.topBarItems;
      // 切换topBarItem 
      for (var i = 0; i < topBarItems.length; i++) {
          if (tab == topBarItems[i].id) {
              topBarItems[i].selected = true;
          } else {
              topBarItems[i].selected = false;
          }
      }
      self.setData({
          topBarItems: topBarItems,
          tab: tab

      })
      if (tab !== 0) {
          this.fetchPostsData(tab);
      } else {
          this.fetchPostsData("1");
      }
  },
  onShareAppMessage: function () {
      var title = "分享我在“" + config.getWebsiteName + "浏览、评论、点赞、鼓励的文章";
      var path = "pages/readlog/readlog";
      return {
          title: title,
          path: path,
          success: function (res) {
              // 转发成功
          },
          fail: function (res) {
              // 转发失败
          }
      }
  },
  fetchPostsData: function (tab) {
      self = this;
      self.setData({
          showerror: 'none',
          shownodata:'none'
      }); 
     var count =0;
     var openid = "";
     var userLevel = "";
     if(tab !='1')
      {
        if (self.data.openid==null) {
          var openid = self.data.openid;
          var mid = self.data.userLevel['mid'];
        }
        else
        {
           Auth.checkSession(self,'isLoginNow');
           return;
        }      }
      if (tab == '1')
      {
          self.setData({
              readLogs: (wx.getStorageSync('readLogs') || []).map(function (log) {
                  count++;
                  return log;
              })
          });
          if (count == 0) {
              self.setData({
                  shownodata: 'block'
              });
          }
      }
      else if (tab == '2')
       {
          self.setData({
              readLogs: []
          });
        var getMyCommentsPosts = wxRequest.getRequest(Api.getWeixinComment(mid));
              getMyCommentsPosts.then(response => {
                  if (response.statusCode == 200) {
                      self.setData({
                          readLogs: self.data.readLogs.concat(response.data.data.map(function (item) {
                              count++;
                              item[0] = item.id;
                              item[1] = item.msg;
                               return item;
                          }))
                      });
                      if (count == 0) {
                          self.setData({
                              shownodata: 'block'
                          });
                      }
                  }
                  else {
                      console.log(response);
                      self.setData({
                          showerror: 'block'
                      });

                  }
              })
      }
      else if (tab == '3') {
          self.setData({
              readLogs: []
          });
        var getMylikePosts = wxRequest.getRequest(Api.getMyLikeUrl(mid));
          getMylikePosts.then(response => {
              if (response.statusCode == 200) {
                  self.setData({
                      readLogs: self.data.readLogs.concat(response.data.data.map(function (item) {
                          count++;
                          item[0] = item.id;
                          item[1] = item.title.rendered;
                          item[2] = "0";
                          return item;
                      }))
                  });

                  if (count == 0) {
                      self.setData({
                          shownodata: 'block'
                      });
                  } 
              }
              else {
                  console.log(response);
                  self.setData({
                      showerror: 'block'
                  });

              }
          })

      }
        else if (tab == '4') {
          self.setData({
            readLogs: []
        });
        
        var getMyFavoritePosts = wxRequest.getRequest(Api.getMyFavorite(mid));
        getMyFavoritePosts.then(response => {
              if (response.statusCode == 200) {
                  self.setData({
                      readLogs: self.data.readLogs.concat(response.data.data.map(function (item) {
                          count++;
                          item[0] = item.id;
                        item[1] = item.title.rendered;
                          item[2] = "0";
                          return item;
                      }))
                  });
                  if (count == 0) {
                      self.setData({
                          shownodata: 'block'
                      });
                  } 
              }
              else {
                  console.log(response);
                  this.setData({
                      showerror: 'block'
                  });

              }
          })

    }
      else if (tab == '5') {
          self.setData({
              readLogs: []
          });
          var url = Api.getSubscription() + '?openid=' + openid;
          var getMysubPost = wxRequest.getRequest(url);              
          getMysubPost.then(response => {
              if (response.statusCode == 200) {
                  var usermetaList = response.data.usermetaList;
                  if (usermetaList)
                  {
                      self.setData({
                          readLogs: self.data.readLogs.concat(usermetaList.map(function (item) {
                              count++;
                              item[0] = item.ID;
                              item[1] = item.post_title;
                              item[2] = "0";
                              return item;
                          }))
                      });

                  }
                  if (count == 0) {
                      self.setData({
                          shownodata: 'block'
                      });
                  }
              }
              else {
                  console.log(response);
                  this.setData({
                      showerror: 'block'
                  });

              }
          })

          
      }
      else if (tab == '6'){
          self.setData({
              readLogs: []
          });
          var getNewComments = wxRequest.getRequest(Api.getNewComments());
          getNewComments.then(response => {
              if (response.statusCode == 200) {
                  self.setData({
                      readLogs: self.data.readLogs.concat(response.data.map(function (item) {
                          count++;
                          item[0] = item.post;
                          item[1] = util.removeHTML(item.content.rendered + '(' + item.author_name + ')');
                          item[2] = "0";
                          return item;
                      }))
                  });
                  if (count == 0) {
                      self.setData({
                          shownodata: 'block'
                      });
                  }

              }
              else {
                  console.log(response);
                  self.setData({
                      showerror: 'block'
                  });

              }
          }).catch(function () {
              console.log(response);
              self.setData({
                  showerror: 'block'
              });

          })
      }
  },  
  closeLoginPopup() {
      this.setData({ isLoginPopup: false });
  },
  openLoginPopup() {
      this.setData({ isLoginPopup: true });
  }
  ,
  confirm: function () {
        this.setData({
            'dialog.hidden': true,
            'dialog.title': '',
            'dialog.content': ''
        })
    } 
})