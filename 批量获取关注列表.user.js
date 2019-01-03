// ==UserScript==
// @name         批量获取关注列表
// @namespace    http://tampermonkey.net/
// @require        http://cdn.bootcss.com/jquery/3.2.1/jquery.min.js
// @version      0.1
// @description  try to take over the world!
// @author       You
// @match        https://m.weibo.cn/profile/*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';
    console.log("请稍等，正在获取关注列表ID...");
    getFollows("https://m.weibo.cn/api/container/getIndex?containerid=231093_-_selffollowed", 0).then(function(list) {
        const follows = list.filter(user=>{return user.card_type===10}).map(user=>{return user.user.id});
        console.log(follows);
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


