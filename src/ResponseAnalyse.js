import React, {Component} from 'react';
import axios from 'axios';
import config from '../config.js'
var PrintTemplate = require ('react-print');


var qref = {
            "5a027fa205ab194bc9ddacd0":"medication usage",
            "5a027fc205ab194bc9ddacd1": "medication usage",
            "5a027fdc05ab194bc9ddacd2":"medication usage",
            "5a02805005ab194bc9ddacd4": "diet",
            "5a02806b05ab194bc9ddacd5": "diet",
            "5a02818756b7134bdaef6648": "diet",
            "5a02819d56b7134bdaef6649": "diet",
            "5a0281af56b7134bdaef664a": "diet",
            "5a0281be56b7134bdaef664b": "diet",
            "5a0281f156b7134bdaef664c": "diet",
            "5a02820a56b7134bdaef664d": "diet",
            "5a02821f56b7134bdaef664e": "diet",
            "5a0282a356b7134bdaef664f": "diet",
            "5a0282ec56b7134bdaef6650": "diet" ,
            "5a027ffb05ab194bc9ddacd3":"diet",
            "5a02830756b7134bdaef6651": "physical activity"  ,
            "5a02833756b7134bdaef6652": "physical activity"   ,
            "5a02835c56b7134bdaef6653": "physical activity",
            "5a02837956b7134bdaef6654":"smoking",
            "5a02838c56b7134bdaef6655":"smoking",
            "5a02854d56b7134bdaef665a":"weight management",
            "5a02856156b7134bdaef665b":"weight management",
            "5a02857556b7134bdaef665c":"weight management",
            "5a02859156b7134bdaef665d":"weight management",
            "5a0285a256b7134bdaef665e":"weight management",
            "5a0285b256b7134bdaef665f": "weight management",
            "5a0285db56b7134bdaef6660":"weight management",
            "5a0285ea56b7134bdaef6661":"weight management",
            "5a0285ff56b7134bdaef6662":"weight management",
            "5a02862c56b7134bdaef6663":"weight management",
            "5a028965d22a784bf9c86775":"alchohol",
            "5a028982d22a784bf9c86776":"alchohol",
            "5a028993d22a784bf9c86777":"alchohol"}


class ResponseAnalyse extends Component{
  constructor(){
    super();
    this.state = {userList:[]}
  }

   summer=(item)=>{
    if(item.length>0){
      return (item.reduce((acc, cu) =>{
          return parseInt(acc) + parseInt(cu)
      }))
    }
  }

   stater = (type, item)=>{
    switch(type) {
        case "medication usage":
            if(item >= 21)
              return "adherent"
            else
              return "non-adherent";
            break;
        case "diet":
          if(item <= 32)
            return "low quality diet";
          else if( item >32 && item <=52)
            return "medium quality diet";
          else
            return "adherent diet";
            break;
        case "physical activity":
            if(item >= 8)
            return "adherent"
            else
              return "non-adherent";
            break;
        case "smoking":
            if(item == 0)
            return "adherent"
            else
              return "non-adherent";
            break;
        case "weight management":
            if(item >= 40)
            return "adherent"
            else
              return "non-adherent";
            break;
        case "alchohol":
            if(item <= 14)
            return "adherent"
            else
              return "non-adherent";
            break;

        default:
          return "non-adherent";
    }
  }

  scoreShower=()=>{
    var obj = {}
    var obc = []
    var stat = []
    var qids = {}


        obj["medication usage"] = []
        obj["diet"] = []
        obj["physical activity"] = []
        obj["smoking"] = []
        obj["weight management"] = []
        obj["alchohol"] = []

    this.props.response.map(id=>{
      // console.log(qref[id.split(" ")[0]])
      // console.log(obj[qref[id.split(" ")[0]]])
        obj[qref[id.split(" ")[0]]] = obj[qref[id.split(" ")[0]]].concat(id.split(" ")[1]);
    })

    return Object.keys(obj).map((key)=>{
      if(obj[key].length>0){
        return <li className= "listItem" key = {key}> <div className="item">{key}</div>   <div className="item">{obj[key]}</div>   <div className="item">{this.summer(obj[key])}</div>  <div className="item">{this.stater(key, this.summer(obj[key]))}</div> </li>
      }
      else{
        return <li className="listItem" key= {key}> <div className="item">{key}</div>   <div className="item">no answers</div>   <div className="item">-</div>     <div className="item">-</div> </li>
      }
    })

  }

  render(){
    return(
      <PrintTemplate>
            <div style={{marginLeft:120,marginTop:150}} id="print-mount">
              <ul>
                <li className="listItem"> <div className="item"  style={{fontWeight: "bolder"}}>Category</div> <div className="item" style={{fontWeight: "bolder"}}>Responses</div> <div className="item" style={{fontWeight: "bolder"}}>Score</div> <div className="item" style={{fontWeight: "bolder"}}>Outcome</div> </li>
                {this.scoreShower()}
              </ul>
            </div>
      </PrintTemplate>
    );
  }
}


export default ResponseAnalyse;
