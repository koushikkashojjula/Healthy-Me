import React, {Component} from 'react';
import { Form, Icon, Input, Button, Checkbox } from 'antd';
const FormItem = Form.Item;

class Login extends Component{

  constructor(){
    super()
    this.state = {username:"", password:""}
  }

  onEValueChange = (event)=>{
    this.setState({username: event.target.value})
  }

  onPValueChange = (event)=>{
    this.setState({password: event.target.value})
  }

  loginClicked = ()=>{
    if(this.state.username && this.state.password){
      this.props.loginClicked(this.state.username, this.state.password)
    }
  }

  handleSubmit = (e) => {
    e.preventDefault();
    this.props.form.validateFields((err, values) => {
      if (!err) {
        console.log('Received values of form: ', values);
        this.props.loginClicked(values.userName, values.password);
      }
    });
  }

  render(){
      const { getFieldDecorator } = this.props.form;
    return(
       <Form onSubmit={this.handleSubmit} className="login-form">
         <FormItem>
           {getFieldDecorator('userName', {
             rules: [{ required: true, message: 'Please input your username!' }],
           })(
             <Input prefix={<Icon type="user" style={{ fontSize: 13 }} />} placeholder="Username" />
           )}
         </FormItem>
         <FormItem>
           {getFieldDecorator('password', {
             rules: [{ required: true, message: 'Please input your Password!' }],
           })(
             <Input prefix={<Icon type="lock" style={{ fontSize: 13 }} />} type="password" placeholder="Password" />
           )}
         </FormItem>
         <FormItem>
           <Button type="primary" htmlType="submit" className="login-form-button">
             Log in
           </Button>
         </FormItem>
       </Form>
    );
  }
}

const WrappedNormalLoginForm = Form.create()(Login);

export default WrappedNormalLoginForm;
