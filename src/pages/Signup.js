import React, { Component } from 'react'
import { connect } from 'react-redux'
import { signin } from '../redux/actions/authActions'
import { Form, Input, Button, Upload, Icon, message } from 'antd'
import style from '../assets/css/pages/Signup.module.less'
import axios from 'axios'
import config from '../config'
import debounce from 'lodash/debounce'

const FormItem = Form.Item;

function getBase64(img, callback) {
	const reader = new FileReader();
	reader.addEventListener('load', () => callback(reader.result));
	reader.readAsDataURL(img);
}

function beforeUpload(file) {
	let fileExtensionFlag = true
	const isJPG = file.type === 'image/jpeg'
	const isPNG = file.type === 'image/png'
	const isGIF = file.type === 'image/gif'
	if (!isJPG && !isPNG && !isGIF) {
			message.error('You can only upload JPG/PNG/GIF file!');
		fileExtensionFlag = false
	}
	const isLt2M = file.size / 1024 / 1024 < 2;
	if (!isLt2M) {
		message.error('Image must smaller than 2MB!');
	}
	return fileExtensionFlag && isLt2M;
}

export class Signup extends Component {
	state = {
		formLayout: 'horizontal',
		loading: false,
		serverSideAvaPath: ''
	}

	handleChange = (info) => {
		if (info.file.status === 'uploading') {
			this.setState({ loading: true });
			return;
		}
		if (info.file.status === 'done') {
			getBase64(info.file.originFileObj, imageUrl => this.setState({
				imageUrl,
				loading: false,
				serverSideAvaPath: info.file.response.imgFilename
			}));
		}
	}

	handleSubmit = (e) => {
		e.preventDefault()

		this.props.form.validateFields((err, values) => {
		//process when everything okay.
		if(!err){
			axios.post(`${config.SERVER_URL}/users`, {
				username : values.username,
				password : values.password,
				email : values.email,
				avaPath : this.state.serverSideAvaPath
			}).then((response)=>{
				if(response.status === 200){
					this.props.dispatch(signin({
						username : values.username,
						password : values.password
					}, ()=>{}))
					this.props.history.push("/")
				}
			})
		}
		})
	}

	handleConfirmPassword = (rule, value, callback) => {
		const { getFieldValue } = this.props.form
		if (value && value !== getFieldValue('password')) {
			callback('Password not match')
		}
		callback()
	}

	handleCheckUsername = (rule, value, callback) => {
		axios.get(`${config.SERVER_URL}/check?username=${value}`)
		.then(function (response) {
			if(response.data){
				callback('this username is already exists')
			}else{
				callback()
			}
		})
	}

  render() {
	const { getFieldDecorator } = this.props.form
	const formItemLayout = this.state.formLayout === 'horizontal' ? {
		labelCol: { span: 6 },
		wrapperCol: { span: 16 },
	} : null
	/*const buttonItemLayout = this.state.formLayout === 'horizontal' ? {
	  wrapperCol: { span: 15, offset: 5 },
	} : null*/
	const uploadButton = (
		<div>
			<Icon type={this.state.loading ? 'loading' : 'plus'} />
			<div className="ant-upload-text">Upload</div>
		</div>
	);
	const imageUrl = this.state.imageUrl

	return (
		<>
			<div className={ style.bg }></div>
			<div className={ style.contentContainer }>
			<h2>Signup</h2>
			<Form
				layout={ this.state.formLayout }
				onSubmit={ this.handleSubmit }
			>
				<FormItem
				label="Username"
				{...formItemLayout}
				>
				{getFieldDecorator('username', {
					rules: [
						{ required: true, message: 'Please input username! ' },
						{ validator: debounce(this.handleCheckUsername, 3000) },
					],
				})(
					<Input size="large" placeholder="Username" />
				)}
				</FormItem>

				<FormItem
				label="Password"
				{...formItemLayout}
				>
				{getFieldDecorator('password', {
					rules: [{ required: true, message: 'Please input password! ' }],
				})(
					<Input type="password" size="large" placeholder="Password" />
				)}
				</FormItem>

				<FormItem
				label="Confirm Password"
				{...formItemLayout}
				>
				{getFieldDecorator('confirm-password', {
					rules: [
						{ required: true, message: 'Please input confirm password! ' },
						{
						validator: this.handleConfirmPassword
						}
					],
				})(
					<Input type="password" size="large" placeholder="Confirm Password" />
				)}
				</FormItem>
				
				<FormItem
				label="E-mail"
				{...formItemLayout}
				>
				{getFieldDecorator('email', {
					rules: [
						{ required: true, message: 'Please input e-mail! ' },
						{
						pattern: new RegExp("^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$"),
						message: "Wrong format!"
						}
					],
				})(
					<Input size="large" placeholder="E-mail" />
				)}
				</FormItem>

				<FormItem
				label="Avatar"
				{...formItemLayout}
				>
				{getFieldDecorator('avatar', {
					rules: [
						{ required: true, message: 'Please select avatar image! ' }
					],
				})(
					<Upload
					name="avatar"
					listType="picture-card"
					showUploadList={false}
					action={`${config.SERVER_URL}/users/avatar`}
					beforeUpload={beforeUpload}
					onChange={this.handleChange}
				>
					{imageUrl ? <img src={imageUrl} alt="avatar" className={ style.previewAvatar}/> : uploadButton}
				</Upload>
				)}
				
				</FormItem>

				<input type="hidden" value={ this.state.serverSideAvaPath } />

				<FormItem className={ style.formItemSubmit }>
					<Button size="large" type="primary" htmlType="submit" className={ style.submitBtn }>
							Register
					</Button>
				</FormItem>
			</Form>
			</div>
		</>
	)
  }
}

const CustomizedForm = Form.create({
	onFieldsChange(props, changedFields) {
		//console.log("onFieldsChange:",props,changedFields);
	},
	mapPropsToFields(props) {
		//console.log("mapPropsToFields:",props);
	},
	onValuesChange(_, values) {
		//console.log("onValuesChange:",values);
	}
})(Signup);

function mapStateToProps(state){
    return {
        errorMessage: state.authReducers.error
    }
}

export default connect(mapStateToProps)(CustomizedForm)