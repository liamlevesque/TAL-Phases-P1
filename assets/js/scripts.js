const tal = {
    sale: {
        name: "Orlando, FL, USA",
        location: "Orlando, FL, USA",
        lotRange: {
            start: 5001,
            end: 5495
        }
    },
    preSoldOffset: 20,
    closeInterval: 30,
    bidder:{
        number: '12345',
    },
    categories: categories,
    lots: lotlist,
    choiceGroups: [],
    watchedLots: [],

    selectedLot: 0,
    confirmPlaceBidVisible: false,

    creatingChoiceGroup: false,
    tempChoiceGroup: [],
    choiceProgress: 1,
    completeChoiceGroupModalVisible: false,

    manageAlertsVisible: false,
};

document.addEventListener('DOMContentLoaded', function(){ 
    for(let i = 0; i < tal.lots.length; i++){
        tal.lots[i].closes = moment().add((i - tal.preSoldOffset) * tal.closeInterval,'seconds');
    };

    var waypoint = new Waypoint({
        element: document.querySelector('.js--nav-pin-waypoint'),
        handler: function(direction) {
            let body = document.querySelector('body');
            if(direction === 'down') body.classList.add('s-pin-nav');
            else body.classList.remove('s-pin-nav');
        }
    })

}, false);


var app = new Vue({
  el: '.js--tal',
  data: tal,
  methods:{
      isSold: function(status){
        if(status === 'sold') return true;
        return false;
      },
      userIsHighBidder: function(bids){
          if(typeof bids[0] !='undefined' && bids[0].bidder === this.bidder.number) return true;
          return false;
      },
      disableNumberInputScroll: function(e){
        e.preventDefault();
      },
      gotoPage(page){
        console.log(page);
        window.location = page + ".html";
      },
      isActivePage: function(path){
        return {
            's-active' : window.location.pathname === path
        }
      },
      placeBid: function(lot){
        this.confirmPlaceBidVisible = true;
        this.selectedLot = lot; 
      },
      completeBid: function(){
        this.confirmPlaceBidVisible = false;
      },
      toggleCreateChoiceGroup: function(){
        this.creatingChoiceGroup = !this.creatingChoiceGroup;
      },
      toggleCompleteChoiceGroupModalVisible: function(){
        this.completeChoiceGroupModalVisible = !this.completeChoiceGroupModalVisible;
      },
      progressClasses: function(step){  
        return {
              's-current': this.choiceProgress === step,
              's-complete': this.choiceProgress > step,
          }
      },
      setChoiceProgress: function(step){
        this.choiceProgress = step;
      },
      toggleManageAlertsVisible: function(){
          this.manageAlertsVisible = !this.manageAlertsVisible;
      }
  },
  computed:{
      findOneLot: function(){
        let context = this;
        return function(number){
            let thislot = [];
            thislot.push(context.lots[number])
            console.log(thislot);
            return thislot;
        }
      }
  },
  filters:{
      returnFirstItem: function(value){
          if(!value) return '';
          return value[0];
      },
      calendarTime: function(time){
        if(!time) return '';
        return moment(new Date(time)).calendar();
      },
      countdownTime: function(closes){
        if(!closes) return '';
        let now = moment();
        let end = moment(closes);
        let span = moment.duration(end - now);
        return span.days() + 'd ' + span.hours() + 'h ' + span.minutes() + 'm ' + span.seconds() + 's';
      }
  }
})  