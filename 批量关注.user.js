// ==UserScript==
// @name         批量关注
// @namespace    http://tampermonkey.net/
// @require      http://cdn.bootcss.com/jquery/3.2.1/jquery.min.js
// @version      0.1
// @description  try to take over the world!
// @author       You
// @match        https://m.weibo.cn/*
// @grant        none
// ==/UserScript==

let follows = [];
let totalPage = 0;
(function() {
    'use strict';
    //待关注用户id列表
    let users = [];
    if(users.length===0){
        console.warn("请先将'批量获取关注列表'脚本获取到的ID数组复制到代码中在执行脚本");
        return;
    }
    console.log("请稍等，正在获取当前用户关注列表ID...");
    getFollows("https://m.weibo.cn/api/container/getIndex?containerid=231093_-_selffollowed", 0).then(function(list) {
        const follows = list.filter(user=>{return user.card_type===10}).map(user=>{return user.user.id});
        users = users.filter(id=>{
            return follows.filter(fid=>{
                return fid===id
            }).length===0
        })
        console.log(users);
        if(users.length>0){
            if (window.confirm(`是否确定批量关注${users.length}位用户?`)) {
                $.get("https://m.weibo.cn/api/config",(rsp)=>{
                    const st = rsp.data.st;
                    users.forEach(userid=>{
                        $.post("https://m.weibo.cn/api/friendships/create",{uid:userid,st:st},createRsp=>{
                            console.log(createRsp);
                        })
                    })
                })
            }
        }
    });
})();

function getFollows(url, page) {
    if(page>0){
        url = `https://m.weibo.cn/api/container/getIndex?containerid=231093_-_selffollowed&page=${page}`;
    }
    return $.get(url)
        .then(function(rsp) {
        if(rsp.ok===0) {//递归结束条件
            return [];
        }
        const followList = rsp.data.cards.filter(card=>{
            return card.itemid !== ''
        });
        return getFollows(url, rsp.data.cardlistInfo.page)//递归调用
            .then(function(nextList) {
            return [].concat(followList[0].card_group, nextList);//合并递归内容
        });
    });
}
