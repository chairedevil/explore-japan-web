import React, { Component } from 'react'
import { connect } from 'react-redux'
import { Modal, Form, Icon, Input, Button } from 'antd'
import { signin } from '../../redux/actions/authActions'
import history from '../../history'

import style from '../../assets/css/components/SigninForm.module.less'

const FormItem = Form.Item

export class SigninForm extends Component {

    handleSubmit = (e) => {
        e.preventDefault();

        this.props.form.validateFields((err, values) => {
            if(!err){
                this.props.dispatch(signin(values, this.props.handleClose))
                history.push('/')
            }
        })
    }

  render() {
    //console.log(style.signinForm)
    const { getFieldDecorator } = this.props.form
    return (
        <Modal
            className={ style.signinForm }
            visible={ this.props.isModalOpen }
            title={ null }
            footer={ null }
            onCancel={ this.props.handleClose }
            centered={ true }
            maskStyle={{
                backgroundColor: 'rgba(0,0,0,0.7)'
            }}
        >
            <h2>Sign in</h2>
            <Form
                onSubmit={ this.handleSubmit }
                layout="vertical"
            >
                <FormItem>
                    {getFieldDecorator('username', {
                        rules: [{ required: true, message: 'Please input your username or email!' }],
                    })(
                        <Input size="large" prefix={<Icon type="user" style={{ color: 'rgba(0,0,0,.25)' }} />} placeholder="Username / Email" />
                    )}
                </FormItem>
                <FormItem>
                    {getFieldDecorator('password', {
                        rules: [{ required: true, message: 'Please input your Password!' }],
                    })(
                        <Input size="large" prefix={<Icon type="lock" style={{ color: 'rgba(0,0,0,.25)' }} />} type="password" placeholder="Password" />
                    )}
                </FormItem>
                {(this.props.errorMessage) &&
                    <FormItem>
                        <p className={ style.errText }>{this.props.errorMessage}</p>
                    </FormItem>
                }
                <FormItem className={ style.formItemSubmit }>
                    <Button size="large" type="primary" htmlType="submit" className={ style.submitBtn }>
                        Sign In
                    </Button>
                </FormItem>
            </Form>
        </Modal>
    )
  }
}

function mapStateToProps(state){
    return {
        errorMessage: state.authReducers.error
    }
}

const WrappedForm = Form.create()(SigninForm);

export default connect(mapStateToProps)(WrappedForm)
