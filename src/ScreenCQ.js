import React, {Component} from 'react';
import axios from 'axios';
import config from '../config.js'
import 'rc-time-picker/assets/index.css';
import moment from 'moment';
import TimePicker from 'rc-time-picker';
import qs from 'qs';
import Tooltip from 'rc-tooltip';
import Slider from 'rc-slider';
const Handle = Slider.Handle;
import 'rc-slider/assets/index.css';
import 'rc-tooltip/assets/bootstrap.css';
import { WithContext as ReactTags } from 'react-tag-input';
const Range = Slider.Range;

const showSecond = true;
const str = showSecond ? 'HH:mm:ss' : 'HH:mm';

class ScreenCQ extends Component{
  timeArray = [moment(),moment(),moment()]
  constructor(){
    super();
    this.likert = []
    this.state = {checked:[true,false],checked2:[false,false,false],checked3:[true,false,false],value:"",tags:[]}
  }

  addQ= ()=>{
    if(this.state.value){
      let data = {}
       data["message"] = this.state.value
       data["questionsubtype"] = (this.state.checked2.includes(true))?(this.state.checked2.findIndex(el => el == true)):(this.state.checked[1]?(this.state.checked3.findIndex(el => el == true)):-1);
       data["questiontype"] = (this.state.checked[0])?2:(this.state.checked[1])?3:1;
       if(this.state.checked[1]){
         if(this.state.checked3[2]){
           data["surveyrange"] = (this.likert.length)?this.likert:[0,10];
         }else if(this.state.checked3[1]){
           if(this.state.tags.length){
             data["surveymulti"] = this.state.tags.map(obj=> obj.text);
           }else{
             data["questionsubtype"] = 0
           }
         }
       }else{
       let temptimeArray = []
         this.timeArray.map((el,index)=>{
           temptimeArray[index] = el.format("HH:mm:ss");
         })
         temptimeArray.push(moment().format("HH:mm:ss"))
         switch (this.state.checked2.findIndex(el => el == true)) {
           case 0:
              data["remind"] = temptimeArray.slice(0,1)
             break;
          case 1:
              data["remind"] = temptimeArray.slice(3)
            break;
          case 2:
              data["remind"] = temptimeArray.slice(1,3)
              break;
           default:

         }
     }


      let token = window.sessionStorage.getItem("token");
      var headers = {
         headers : {
              'Content-Type':'application/json',
              "username": "admin",
              'token': token
          }
        }
      axios.post(`${config.rootUrl}/message`,data,headers)
            .then(function (response) {
              if(response.data.success){
                this.setState({value: ""})
              }
              else{
                  this.setState({err : response.data.error})
              }
            }.bind(this))
            .catch(function (error) {
              // if(!response.data.success)
              //   this.setState({err : response.data.status})
              console.log(error);
            });
    }
  }

  checkbox2Setter=(id)=>{
    let temp = [false,false,false]
    if(!this.state.checked2[id]){
      temp[id] = true;
    }
    this.setState({checked2: temp})
  }

  checkbox3Setter=(id)=>{
    let temp;
    if(!this.state.checked3[id]){
      temp = [false,false,false]
      temp[id] = true;
      this.setState({checked3: temp})
    }
  }

  checkboxSetter=(id)=>{
    let temp = this.state.checked
    switch (id) {
      case "0":
          if(this.state.checked[0]){
            temp[0] = false
          }else{
            temp[0] = true
            temp[1] = false
          }
        break;
      case "1":
        if(this.state.checked[1]){
          temp[1] = false
        }else{
          temp[1] = true
          temp[0] = false
        }
      break;
      default:
    }
    this.setState({checked: temp})
  }

  onChangeTime=(id,m)=>{
    this.timeArray[id] = m
  }
  calledTime = 0;
  handle = (props) => {
    const { value, dragging, index, ...restProps } = props;
    if(this.calledTime%2==0){
      this.likert[0] = value
      console.log(this.likert)
    }else{
      this.likert[1] = value
      console.log(this.likert)
    }
    this.calledTime++
    return (
      <Tooltip
        prefixCls="rc-slider-tooltip"
        overlay={value}
        visible={dragging}
        placement="top"
        key={index}
      >
        <Handle value={value} {...restProps} />
      </Tooltip>
    );
  };

  handleDelete = (i)=> {
    let tags = this.state.tags;
    tags.splice(i, 1);
    this.setState({tags: tags});
  }

  handleAddition = (tag)=> {
    let tags = this.state.tags;
    tags.push({
        id: tags.length + 1,
        text: tag
    });
    this.setState({tags: tags});
  }
  renderSub=()=>{
    if(!this.state.checked[1])
      return  <div style={{    marginLeft: "45%"}}className= "cqCheck">
                <input className="cqInputCheck"  id={0} checked={this.state.checked2[0]} onChange={(e)=>this.checkbox2Setter(e.target.id)}  type="checkbox"/><div style={{marginRight :100}}> Daily Once </div>
                <input className="cqInputCheck" id={1} checked={this.state.checked2[1]} onChange={(e)=>this.checkbox2Setter(e.target.id)}  type="checkbox"/><div style={{marginRight :100}}> Every Hour </div>
                <input className="cqInputCheck" id={2} checked={this.state.checked2[2]} onChange={(e)=>this.checkbox2Setter(e.target.id)}  type="checkbox"/><div style={{marginRight :100}}> Daily Twice </div>
              </div>
    else{
      return  <div style={{    marginLeft: "45%"}}className= "cqCheck">
                <input className="cqInputCheck"  id={0} checked={this.state.checked3[0]} onChange={(e)=>this.checkbox3Setter(e.target.id)}  type="checkbox"/><div style={{marginRight :100}}> Open Text </div>
                <input className="cqInputCheck" id={1} checked={this.state.checked3[1]} onChange={(e)=>this.checkbox3Setter(e.target.id)}  type="checkbox"/><div style={{marginRight :100}}> Multiple Choice </div>
                <input className="cqInputCheck" id={2} checked={this.state.checked3[2]} onChange={(e)=>this.checkbox3Setter(e.target.id)}  type="checkbox"/><div style={{marginRight :100}}> Likert Scale </div>
              </div>
    }
  }

  renderSub2=()=>{
    if(!this.state.checked[1]){
      if(this.state.checked2[0]){
          return <div style={{marginLeft:"44%", marginTop:20,position: "absolute"}}><TimePicker style={{ width: 70 }} showSecond={showSecond} defaultValue={moment()} className="xxx" onChange={(m)=>this.onChangeTime(0,m)}/> </div>
      }
      else if(this.state.checked2[2]){
        return  <div style={{marginLeft:"42%", marginTop:20, position: "absolute"}}>
                  <TimePicker style={{ width: 70 }} showSecond={showSecond} defaultValue={moment()} className="xxx" onChange={(m)=>this.onChangeTime(1,m)}/>
                  <TimePicker style={{ width: 70 }} showSecond={showSecond} defaultValue={moment()} className="xxx" onChange={(m)=>this.onChangeTime(2,m)}/>
                </div>
      }
    }else{
      if(this.state.checked3[1]){
          return <div style={{marginLeft:((this.state.tags.length > 4)?'35%':`${45 - 2*(this.state.tags.length)}%`), marginTop:20, position: "absolute",width:400}}>
                  <ReactTags tags={this.state.tags}
                    handleDelete={this.handleDelete}
                    handleAddition={this.handleAddition}
                    placeholder= "Add a choice" />
                </div>
      }
      else if(this.state.checked3[2]){

        return  <div style={{marginLeft:"40%", marginTop:40}}>
                    <Range min={0} max={10} defaultValue={[0,10]} handle={this.handle} />
                </div>
      }
    }
  }

  render(){
    return(
      <div style={{marginLeft: "10%"}}>
        <div><input className= "cqInput" placeholder="Please Enter your Question here...." value= {this.state.value} onChange={event=>this.setState({value: event.target.value})}/></div>
        <div className= "cqCheck" style={{marginLeft:"46%"}}>
          <input className="cqInputCheck" id={0} checked={this.state.checked[0]} onChange={(e)=>this.checkboxSetter(e.target.id)} type="checkbox"/><div style={{marginRight :30}}> Make it a Yes or No Question </div>
          <input className="cqInputCheck" id={1} checked={this.state.checked[1]} onChange={(e)=>this.checkboxSetter(e.target.id)} type="checkbox"/><div style={{marginRight :30}}> Make it a Survey Question </div>
        </div>
        {this.renderSub()}
        {this.renderSub2()}
        <div ><button className = "cqButton" onClick= {()=>this.addQ()}> {(this.state.checked[1])?'Add Survey Question':(this.state.checked[0])?'Add Question': 'Add Message'} </button></div>
      </div>
    )
  }
}



export default ScreenCQ;
