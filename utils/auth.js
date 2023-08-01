/*
 * 
 * 雅趣·慢享小程序
 */

var util = require('util.js');
var wxApi = require('wxApi.js')
var wxRequest = require('wxRequest.js')
var Api = require('api.js');
var app = getApp();

const Auth = {}

Auth.checkSession = function (appPage, flag) {
    let openid = wx.getStorageSync('openid');
    if (!openid) {
        if ('isLoginNow' == flag) {
            var userInfo = {
                avatarUrl: "../../images/gravatar.png",
                nickName: "登录",
                isLogin: false
            }
            appPage.setData({
                isLoginPopup: true,
                userInfo: userInfo
            });
        }

    }
}
Auth.checkLogin = function (appPage) {
    let wxLoginInfo = wx.getStorageSync('wxLoginInfo');
    wx.checkSession({
        success: function () {
            if (!wxLoginInfo.js_code) {
                Auth.wxLogin().then(res => {
                    appPage.setData({
                        wxLoginInfo: res
                    });
                    wx.setStorageSync('wxLoginInfo', res);
                    console.log('checkSession_success_wxLogins');
                })
            }
        },
        fail: function () {
            Auth.wxLogin().then(res => {
                appPage.setData({
                    wxLoginInfo: res
                });
                wx.setStorageSync('wxLoginInfo', res);
                console.log('checkSession_fail_wxLoginfo');
            })
        }
    })
}
Auth.checkAgreeGetUser = function (e, userinfo, appPage, authFlag) {
    let wxLoginInfo = wx.getStorageSync('wxLoginInfo');
    if (wxLoginInfo.js_code) {
			let userLevel={}
			userLevel.level = "0";
			userLevel.levelName = "订阅者";
			// console.log(userinfo)
			wx.setStorageSync('userInfo', userinfo)
			wx.setStorageSync('openid', "openid");
			wx.setStorageSync('userLevel', userLevel);
			appPage.setData({
				userInfo:userinfo,
				isLoginPopup:false,
				openid:"openid",
				userLevel:userLevel
			})
    } else {
        console.log("登录失败");
        wx.showToast({
            title: '登录失败',
            mask: false,
            duration: 1000
        });

    }
}

Auth.setUserInfoData = function (appPage) {
    if (!appPage.data.openid) {
        appPage.setData({
            userInfo: wx.getStorageSync('userInfo'),
            openid: wx.getStorageSync('openid'),
            userLevel: wx.getStorageSync('userLevel')
        })

    }

}
Auth.wxLogin = function () {
    return new Promise(function (resolve, reject) {
        wx.login({
            success: function (res) {
                let args = {};
                args.js_code = res.code;
                resolve(args);
            },
            fail: function (err) {
                console.log(err);
                reject(err);
            }
        });
    })

}
Auth.logout = function (appPage) {
    appPage.setData({
        openid: '',
        userLevel: {},
        userInfo: {},
        wxLoginInfo: {}
    })
    wx.removeStorageSync('userInfo');
    wx.removeStorageSync('openid');
    wx.removeStorageSync('userLevel');
    wx.removeStorageSync('wxLoginInfo');
}
module.exports = Auth;