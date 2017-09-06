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
    watchedLots: ['5001','5022','5031','5042','5045'],

    selectedLot: 0,
    confirmPlaceBidVisible: false,
    confirmPlaceMaxBidVisible: false,
    invalidMaxBidVisible: false,
    offIncrementMaxBidVisible: false,

    creatingChoiceGroup: false,
    tempChoiceGroup: [],
    choiceProgress: 1,
    completeChoiceGroupModalVisible: false,

    manageAlertsVisible: false,

    increments: incrementTable,
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
      userWasOutbid: function(bids){
        if(typeof bids[0] ==='undefined') return false;
        if(bids[0].bidder === this.bidder.number) return false;
        for(let i = 1; i < bids.length; i++){
            if(bids[i].bidder === this.bidder.number) return true;
        }
      },
      userIsMaxBidder: function(lot){
        if(lot.maxBid.bidder === this.bidder.number) return true;
        return false;
      },
      disableNumberInputScroll: function(e){
        e.preventDefault();
      },
      gotoPage(page){
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
      placeMaxBid: function(lot){
        if(lot.tempMaxBid === null) {
            this.toggleInvalidMaxBidVisible();
            lot.tempMaxBid = null;
        }
        else this.toggleOffIncrementMaxBidVisible();
        //else this.confirmPlaceMaxBidVisible = true;
        
        this.selectedLot = lot; 
      },
      confirmMaxBid: function(){
        this.offIncrementMaxBidVisible = false;
        this.confirmPlaceMaxBidVisible = true;
      },
      completeBid: function(){
        this.confirmPlaceBidVisible = false;
        this.watchLot(this.selectedLot,false);
        this.pricedBid(this.selectedLot,'quick',this.bidder.number,5)
      },
      watchLot: function(lot,removeIfExists){
        if(this.watchedLots.indexOf(lot.lotNumber) < 0){ //IF NOT WATCHING YET
            this.watchedLots.push(lot.lotNumber);
        }else{
            if(removeIfExists) this.watchedLots.splice(this.watchedLots.indexOf(lot.lotNumber),1);
        }
      },
      completeMaxBid: function(){
        this.confirmPlaceMaxBidVisible = false;
        this.watchLot(this.selectedLot,false);
        this.pricedBid(this.selectedLot,'max',this.bidder.number,5);
        this.selectedLot.maxBid.bid = this.selectedLot.tempMaxBid;
        this.selectedLot.maxBid.bidder = this.bidder.number;
      },

      pricedBid: function(lot,type,bidder,amt){
        lot.bids.unshift(this.buildBid(bidder,amt,type));
      },

      buildBid: function(bidder,amt,type) {
        let bid = {
            bidder: this.bidder.number,
            bid: amt,
            time: new Date().toJSON(),
            type: type,
        };
        
        return bid;
      },
      toggleInvalidMaxBidVisible: function(){
        this.invalidMaxBidVisible = !this.invalidMaxBidVisible;
      },
      toggleOffIncrementMaxBidVisible: function(){
        this.offIncrementMaxBidVisible = !this.offIncrementMaxBidVisible;
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
      },
      toggleWatchStatus: function(lot){
        this.watchLot(lot,true);
      },
      
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
      },
      lotsImWatching: function(){
        return this.lots.filter(lot => this.watchedLots.indexOf(lot.lotNumber) >= 0);
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