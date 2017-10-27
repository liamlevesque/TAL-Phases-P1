
const tal = {
  sale: {
    name: "Orlando, FL, USA",
    location: "Orlando, FL, USA",
    lotRange: {
      start: 5001,
      end: 5495
    },
    paused: false
  },
  preSoldOffset: 20,
  closeInterval: 15,
  timeClosingSoon: 30,
  timeGoingGoing: 10,
  currentTime: moment(),
  bidder: {
    number: "12345"
  },
  categories: categories,
  lots: lotlist,
  watchedLots: ["5001", "5022", "5028", "5031", "5042", "5045"],
  mobileMoreMenuVisible: false,

  selectedLot: 0,
  confirmPlaceBidVisible: false,
  confirmPlaceMaxBidVisible: false,
  invalidMaxBidVisible: false,
  offIncrementMaxBidVisible: false,

  groupMaximumLots: 20,
  creatingChoiceGroup: false,
  tempChoiceGroupArray: [],
  tempChoiceGroup: [],
  choiceProgress: 1,
  completeChoiceGroupModalVisible: false,
  choiceGroups: [
    {
      uid: "123456",
      type: "group",
      lots: ["5099", "5100", "5101", "5102"],
      quantity: 2,
      maxbid: 100
    }
  ], 

  purchasedLots: ["5001", "5004"],
  searchResults: ["5045", "5046", "5047", "5048", "5049", "5050"],

  manageAlertsVisible: false,

  increments: incrementTable,

  activeThumbnail: 0,

  pausedMessageVisible: false,

  showSecondaryHeader: true,

  outbidMessageVisible: false,
  outbidMessageLot: lotlist[33],
  messages: [1,1],
  notificationsMinimized: false,
};

document.addEventListener(
  "DOMContentLoaded",
  function() {
    for (let i = 0; i < tal.lots.length; i++) {
      tal.lots[i].closes = moment().add(
        (i - tal.preSoldOffset) * tal.closeInterval,
        "seconds"
      );
    }

    setInterval(function(){
      app.currentTime = moment();
    },1000);

    var waypoint = new Waypoint({
      element: document.querySelector(".js--nav-pin-waypoint"),
      handler: function(direction) {
        let body = document.querySelector("body");
        if (direction === "down") {
          body.classList.add("s-pin-nav");
          let headerheight = document.querySelector(".js--pinned-header")
            .offsetHeight;
          document.querySelector(".js--nav-pin-waypoint").style.height =
            headerheight + "px";
          //document.querySelector('body').scrollTop -= headerheight;
        } else {
          body.classList.remove("s-pin-nav");
          document.querySelector(".js--nav-pin-waypoint").style.height = "0px";
        }
      }
    });
  },
  false
);

var app = new Vue({
  el: ".js--tal",
  data: tal,
  methods: {
    isSold: function(status) {
      if (status === "sold") return true;
      return false;
    },
    userIsHighBidder: function(bids) {
      if (
        typeof bids[0] != "undefined" &&
        bids[0].bidder === this.bidder.number
      )
        return true;
      return false;
    },
    userWasOutbid: function(bids) {
      if (typeof bids[0] === "undefined") return false;
      if (bids[0].bidder === this.bidder.number) return false;
      for (let i = 1; i < bids.length; i++) {
        if (bids[i].bidder === this.bidder.number) return true;
      }
    },
    userIsMaxBidder: function(lot) {
      if (lot.maxBid.bidder === this.bidder.number) return true;
      return false;
    },
    userHasInGroupBid: function(lotNumber) {
      let grouped = this.choiceGroups.filter(
        group => group.lots.indexOf(lotNumber) >= 0
      );
      if (grouped.length > 0) return true;
      return false;
    },
    disableNumberInputScroll: function(e) {
      e.preventDefault();
    },
    gotoPage: function(page) {
      window.location = page + ".html";
    },
    isActivePage: function(paths) {
      for(var i = 0; i< paths.length; i++){
        if(window.location.pathname.split("/").pop() === paths[i]) 
          return {
            "s-active": window.location.pathname.split("/").pop() === paths[i]
          };
      }
    },
    placeBid: function(lot) {
      this.confirmPlaceBidVisible = true;
      this.selectedLot = lot;
    },
    placeMaxBid: function(lot) {
      if (lot.tempMaxBid === null) {
        this.toggleInvalidMaxBidVisible();
        lot.tempMaxBid = null;
      } else this.toggleOffIncrementMaxBidVisible();
      //else this.confirmPlaceMaxBidVisible = true;

      this.selectedLot = lot;
    },
    confirmMaxBid: function() {
      this.offIncrementMaxBidVisible = false;
      this.confirmPlaceMaxBidVisible = true;
    },
    completeBid: function() {
      this.confirmPlaceBidVisible = false;
      this.watchLot(this.selectedLot, false);
      this.pricedBid(this.selectedLot, "quick", this.bidder.number, 5);
    },
    watchLot: function(lot, removeIfExists) {
      if (this.watchedLots.indexOf(lot.lotNumber) < 0) {
        //IF NOT WATCHING YET
        this.watchedLots.push(lot.lotNumber);
      } else {
        if (removeIfExists)
          this.watchedLots.splice(this.watchedLots.indexOf(lot.lotNumber), 1);
      }
    },
    completeMaxBid: function() {
      this.confirmPlaceMaxBidVisible = false;
      this.watchLot(this.selectedLot, false);
      this.pricedBid(this.selectedLot, "max", this.bidder.number, 5);
      this.selectedLot.maxBid.bid = this.selectedLot.tempMaxBid;
      this.selectedLot.maxBid.bidder = this.bidder.number;
    },

    pricedBid: function(lot, type, bidder, amt) {
      lot.bids.unshift(this.buildBid(bidder, amt, type));
      let span = closingTime(lot.closes);
      if(lot.extended || (span.days() === 0 && span.hours() === 0 && span.minutes() < 2 )){
        lot.closes = moment().add(2,'minutes');
        lot.extended = true;
      } 
    },

    buildBid: function(bidder, amt, type) {
      let bid = {
        bidder: bidder,
        bid: amt,
        time: new Date().toJSON(),
        type: type
      };

      return bid;
    },
    toggleInvalidMaxBidVisible: function() {
      this.invalidMaxBidVisible = !this.invalidMaxBidVisible;
    },
    toggleOffIncrementMaxBidVisible: function() {
      this.offIncrementMaxBidVisible = !this.offIncrementMaxBidVisible;
    },
    toggleCreateChoiceGroup: function() {
      this.creatingChoiceGroup = !this.creatingChoiceGroup;
    },
    toggleCompleteChoiceGroupModalVisible: function() {
      this.completeChoiceGroupModalVisible = !this
        .completeChoiceGroupModalVisible;
    },
    updateChoiceGroup: function(){
      this.tempChoiceGroup = [];
      this.tempChoiceGroupArray.map( key => this.tempChoiceGroup.push(this.lots[key]))
    },
    progressClasses: function(step) {
      return {
        "s-current": this.choiceProgress === step,
        "s-complete": this.choiceProgress > step
      };
    },
    setChoiceProgress: function(step) {
      this.choiceProgress = step;
    },
    finishChoiceGroup: function() {
      for(let i = 0; i < this.tempChoiceGroup.length; i++){
        console.log(this.tempChoiceGroup.length);
        if(this.tempChoiceGroup[i].status === 'notinyard' || this.tempChoiceGroup[i].status === 'sold'){
          this.choiceProgress = 5;
          return;
        }
      }

      let newGroup = {
        uid: new Date().toJSON(),
        type: "group",
        lots: this.tempChoiceGroup,
        quantity: this.tempChoiceGroup.length,
        maxbid: 100
      };

      this.choiceGroups.push(newGroup);
      this.toggleCompleteChoiceGroupModalVisible();
    },
    toggleManageAlertsVisible: function() {
      this.manageAlertsVisible = !this.manageAlertsVisible;
    },
    toggleWatchStatus: function(lot) {
      this.watchLot(lot, true);
    },
    lotsInGroup: function(lots) {
      return this.lots.filter(lot => lots.indexOf(lot.lotNumber) >= 0);
    },
    setActiveThumbnail: function(index) {
      this.activeThumbnail = index;
    },
    nextIncrement: function(lot) {
      return (
        lot.bids.length > 0 ? lot.bids[0].bid + 5 : "5"
      );
    },
    togglePausedMessageVisible: function() {
      this.pausedMessageVisible = !this.pausedMessageVisible;
    },
    togglePausedState: function() {
      this.sale.paused = !this.sale.paused;
    },
    toggleMobileMoreMenuVisible: function() {
      this.mobileMoreMenuVisible = !this.mobileMoreMenuVisible;
    },
    createOrAddToChoiceGroup: function(lot) {
      if (!this.creatingChoiceGroup) this.creatingChoiceGroup = true;
      if (this.tempChoiceGroup.indexOf(lot) < 0)
        this.tempChoiceGroup.push(lot); 
    },

    emptyPurchases: function() {
      this.purchasedLots = [];
    },
    emptyWatching: function() {
      this.watchedLots = [];
    },
    emptyGroups: function() {
      this.choiceGroups = [];
    },
    emptySearch: function() {
      this.searchResults = [];
    },
    toggleViewerMode: function(){
      this.bidder.number = (this.bidder.number != null)? null : '12345' ; 
    },

    countdown(lot){
      let span = moment.duration(lot.closes - this.currentTime);
      //let extendedSpan = moment.duration(lot.extendedClose - this.currentTime);
      
      if(span.seconds() < 0){ 
        lot.status = 'sold';
      }
      return (
        span.days() +
        "d " +
        span.hours() +
        "h " +
        span.minutes() +
        "m " +
        span.seconds() +
        "s"
      );
    },
    closingSoon: function(lot){
      if(lot.extended) return true;
      let span = closingTime(lot.closes);
      if(span.days() === 0 && span.hours() === 0 && span.minutes() === 0 && span.seconds() < this.timeClosingSoon) return true;
      return false;
    },
    closingSoonString: function(lot){
      if (!lot.closes) return "";
      let span = closingTime(lot.closes);
      if(span.days() === 0 && span.hours() === 0 && span.minutes() === 0 && span.seconds() < this.timeGoingGoing) return "Going, Going...";
      else if((span.days() === 0 && span.hours() === 0 && span.minutes() === 0 && span.seconds() < this.timeClosingSoon) || lot.extended) return "Closing Soon!";
      //else if() return "Closing Soon!"
    },
    toggleOutbidMessage: function(){
      this.outbidMessageVisible = !this.outbidMessageVisible;
      if(this.outbidMessageVisible) this.pricedBid(this.outbidMessageLot, "quick", '10005', 105);
    },
    navigateToLot: function(lotNumber){
      this.outbidMessageVisible = false;
      if(document.body.scrollIntoView){
        let element = document.getElementById(lotNumber);
        element.scrollIntoView({behavior: "smooth"});
      }
      else{
        window.location += "#"+lotNumber;
      }
    },
    lotStatus:function(lot){
      return{
        's-sold':lot.status === 'sold',
        's-sold-to-you':lot.status === 'sold' && lot.bids[0] && lot.bids[0].bidder === this.bidder.number
      }
    },
    toggleNotificationsMinimized: function(){
      this.notificationsMinimized = !this.notificationsMinimized;
    },


  },
  computed: {
    findOneLot: function() {
      let context = this;
      return function() {
        let thislot = [];
        let desiredLot = parseInt(window.location.hash.split("#")[1]);
        desiredLot = desiredLot > 0 ? desiredLot : 0;
        thislot.push(context.lots[desiredLot]);
        return thislot;
      };
    },
    lotsImWatching: function() {
      return this.lots.filter(
        lot => this.watchedLots.indexOf(lot.lotNumber) >= 0
      );
    },
    lotsIveWon: function() {
      return this.lots.filter(
        lot => this.purchasedLots.indexOf(lot.lotNumber) >= 0
      );
    },
    searchedLots: function() {
      return this.lots.filter(
        lot => this.searchResults.indexOf(lot.lotNumber) >= 0
      );
    },

  },
  filters: {
    returnFirstItem: function(value) {
      if (!value) return "";
      return value[0];
    },
    calendarTime: function(time) {
      if (!time) return "";
      return moment(new Date(time)).calendar();
    },
    countdownTime: function(closes) {
      if (!closes) return "";
      let span = closingTime(closes);
      return (
        span.days() +
        "d " +
        span.hours() +
        "h " +
        span.minutes() +
        "m " +
        span.seconds() +
        "s"
      );
    },
    
  }
});


function closingTime(closes){
  let now = moment();
  let end = moment(closes);
  return moment.duration(end - now);
}