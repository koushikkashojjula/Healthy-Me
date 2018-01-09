import React, {Component} from 'react';
import axios from 'axios';
import config from '../config.js'
import Modal from 'react-modal';
import { Card, Col, Row } from 'antd';
import Select from 'react-select';


class ScreenMS extends Component{
  constructor(){
    super();
    this.state={surveyList:undefined, messages: undefined,modalIsOpen:false,selectedSurvey:undefined}
  }

  componentDidMount(){
    this.dataCaller()
    this.surveyCaller()
  }

  surveyUpdater=(survey)=>{
    let token = window.sessionStorage.getItem("token");
    var headers = {
       headers : {
            'Content-Type':'application/json',
            "username": "admin",
            'token': token
        }
      }
    if(survey.sid){
      axios.put(`${config.rootUrl}/survey`,survey,headers)
            .then(function (response) {
              if(response.data.success){
                this.surveyCaller()
              }
              else{
                  this.setState({err : response.data.status})
              }
            }.bind(this))
            .catch(function (error) {
              console.log(error);
            });
    }else{
      axios.post(`${config.rootUrl}/survey`,survey,headers)
            .then(function (response) {
              if(response.data.success){
                this.surveyCaller()
              }
              else{
                  this.setState({err : response.data.status})
              }
            }.bind(this))
            .catch(function (error) {
              console.log(error);
            });
    }

  }

  surveyCaller=()=>{
    let token = window.sessionStorage.getItem("token");
    var headers = {
       headers : {
            'Content-Type':'application/json',
            "username": "admin",
            'token': token
        }
      }
    axios.get(`${config.rootUrl}/survey`,headers)
          .then(function (response) {
            if(!response.data.success){
              this.setState({selectedSurvey:undefined,surveyList: response.data||[]})
            }
            else{
                this.setState({err : response.data.error})
            }
          }.bind(this))
          .catch(function (error) {
            console.log(error);
          });
  }

  deleteSurvey=()=>{
      let token = window.sessionStorage.getItem("token")
      var headers = {
         headers : {
              'Content-Type':'application/json',
              "username": "admin",
              'token': token
          }
        }
      axios.delete(`${config.rootUrl}/survey?sid=${this.state.selectedSurvey.sid}`,headers)
            .then(function (response) {
              if(response.data.success){
                this.surveyCaller()
              }
              else{
                  this.setState({err : response.data.status})
              }
            }.bind(this))
            .catch(function (error) {
              console.log(error);
            });
  }

  dataCaller=()=>{
    let token = window.sessionStorage.getItem("token");
    var headers = {
       headers : {
            'Content-Type':'application/json',
            "username": "admin",
            'token': token
        }
      }
    axios.get(`${config.rootUrl}/message`,headers)
          .then(function (response) {
            if(!response.data.success){
              this.setState({messages: response.data.filter(msg=>msg.questiontype==3)})
            }
            else{
                this.setState({err : response.data.error})
            }
          }.bind(this))
          .catch(function (error) {
            console.log(error);
          });
  }


  renderCards = ()=>{
    let cardArray = []

     this.state.surveyList.map((survey,id)=>{
          cardArray.push(<div key={id} className="surveyCard" onClick={()=>{this.surveyClick(survey)}}>
                        <div className="surveyCardhead"> {survey.survey} </div>
                        <span className="surveyCardfoot1">{(survey.quesionsassociated)?"Q"+survey.quesionsassociated.length:""}</span>
                        <span className="surveyCardfoot">{(survey.users)?"U"+survey.users.length:""}</span>
                </div>
              );
      })
      cardArray.push(this.plusCard())
      return cardArray
  }

  plusCard = ()=>{
    let survey = {users:[],quesionsassociated:[]}
      return <div key={-1} className="surveyCard" style={{background:"white"}} onClick={()=>{this.surveyClick(survey)}}>
          <div className="surveyCardhead">
            Add new
          </div>
      </div>
  }

  surveyClick=(sur)=>{
      let options =[]
      let users = this.props.users
      let value = []
      let usernames = []
      let selectedQ = []
      let unselectedQ= []
      users.map(user=>{
        let obj = {}
           obj["value"] = user.username;
           obj["label"] = user.username;
           options.push(obj)
      })
      this.props.users.map(usr=>{
          usernames.push(usr.username)
      })
      if(sur.users)
          sur.users.map(user=>{
            if(usernames.includes(user)){
              value.push(user)
            }
          })
      this.state.messages.map(q=>{
        if(!sur.quesionsassociated.find(q2=> q.mid == q2)){
          unselectedQ.push(q)
        }else{
          selectedQ.push(q)
        }
      })
    this.title = ""
    this.setState({selectedSurvey: sur, options: options, value : value.length?value.join():null, selectedQ: selectedQ, unselectedQ: unselectedQ})
  }

  customStyles = {
      overlay : {
      position          : 'fixed',
      top               : 0,
      left              : '13%',
      right             : 0,
      bottom            : 0,
      backgroundColor   : 'rgba(212, 205, 205, 0.75)'
    },
      content : {
        position: "relative",
        marginTop: "25%",
        marginLeft: "50%",
        width: "90%",
        border: "1px solid black",
        background: "white",
        overflow: "auto",
        borderRadius: 4,
        outline: "none",
        padding: 20,top:0,left:0,right:0,bottom:0,
        transform : 'translate(-50%, -50%)'
      }
    };

  HiItems = (value)=>{
    this.setState({value:value})
  }

  publishChanges=()=>{
    let survey = this.state.selectedSurvey;
        survey["survey"] = (survey.survey)?survey.survey:this.title
    if(survey.survey){
        survey["users"] = (this.state.value)?this.state.value.split(","):[];
        let selectedQ = this.state.selectedQ;
        selectedQ.reduce((pre,cur)=>{pre.push(cur.mid); return pre},[]); //get id's
        survey["quesionsassociated"] = selectedQ.reduce((pre,cur)=>{pre.push(cur.mid); return pre},[]);
        survey["ispublished"] = true;
        survey["publishedtime"] = new Date();
        this.surveyUpdater(survey)
      }
  }

  listComponent=(check)=>{
    if(check){
      return(
        this.state.selectedQ.map((li,id)=>{
          return <div key={id} style={{marginLeft:7,cursor:"pointer"}} onDoubleClick={()=>this.doubleCLick(check,li)}> {li.message} </div>
        })
      )
    }else{
      return(
        this.state.unselectedQ.map((li,id)=>{
          return <div key={id} style={{marginLeft:7,cursor:"pointer"}} onDoubleClick={()=>this.doubleCLick(check,li)}> {li.message} </div>
        })
      )
    }

  }

  doubleCLick =(check,li)=>{
    let selectedQ;
    let unselectedQ ;
    if(check){
         selectedQ = this.state.selectedQ.filter(l=>l!=li)
         unselectedQ = this.state.unselectedQ;
         unselectedQ.unshift(li);
    }else{
         unselectedQ = this.state.unselectedQ.filter(l=>l!=li)
         selectedQ = this.state.selectedQ;
         selectedQ.unshift(li);
    }
    this.setState({selectedQ:selectedQ,unselectedQ:unselectedQ})
  }

  modalRender=()=>{
    if(this.state.selectedSurvey)
      return(
        <Modal isOpen={this.state.selectedSurvey != undefined} ariaHideApp={false} style={this.customStyles}>
          {(this.state.selectedSurvey.survey)?<span style={{display:"inherit", textAlign:"center", fontSize:25, fontStyle:"bold"}}> {this.state.selectedSurvey.survey} </span>:<input className= "sqInput" placeholder="Please Enter Survey title here...." onChange={event=>this.title= event.target.value}/>}
          <div style={{display:"-webkit-box",marginTop:10,marginBottom:20}}>
            <div style={{marginLeft:"20%"}}>
              <span style={{marginLeft:"20%",fontSize:20, fontStyle:"bold"}}> Selected Questions </span>
              <div className="modalList">
                {this.listComponent(true)}
              </div>
            </div>
            <div style={{marginLeft:"20%"}}>
              <span style={{marginLeft:"15%",fontSize:20 , fontStyle:"bold"}}> Unselected Questions </span>
              <div className="modalList">
                {this.listComponent(false)}
              </div>
            </div>
          </div>
          <Select name="form-field-name"  value={this.state.value} simpleValue= {true}   options={this.state.options}   placeholder= 'Select Patients for this survey'  onChange={this.HiItems}  multi={true}   />
          <div>
            <button className= "mqButton" onClick={()=>this.publishChanges()}> Publish Changes </button>
            <button className= "mqButton" style={{marginLeft:30}} onClick={()=>this.deleteSurvey()}> Delete </button>
            <button className= "mqButton" style={{marginLeft:"75%"}} onClick={()=>this.setState({selectedSurvey: undefined})}> Cancel </button>
          </div>
        </Modal>
      )
  }

  renderContent=()=>{
    if(this.state.surveyList && this.state.messages){
        return (
          <div style={{marginLeft:"15%",marginRight:"2%",marginTop:20}}>
            <div style={{display:"-webkit-inline-box"}}>
              {this.renderCards()}
            </div>
              {this.modalRender()}
          </div>
        )
    }
      return "MS data loading"

  }


  render(){
    return (
      this.renderContent()
    )
  }
}

export default ScreenMS;
