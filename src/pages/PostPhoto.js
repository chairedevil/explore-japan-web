import React, { Component } from 'react'
import { connect } from 'react-redux'
import axios from 'axios'
import moment from 'moment'
import EXIF from 'exif-js'

import { Form, Input, DatePicker, Select, Button, message, Icon, Upload, Tag, Tooltip } from 'antd';
import style from '../assets/css/pages/PostArticle.module.less'

import config from '../config'

const { Option } = Select
const prefectures = ["Hokkaido","Aomori","Iwate","Miyagi","Akita","Yamagata","Fukushima","Ibaraki","Tochigi","Gunma","Saitama","Chiba","Tokyo","Kanagawa","Niigata","Toyama","Ishikawa","Fukui","Yamanashi","Nagano","Gifu","Shizuoka","Aichi","Mie","Shiga","Kyoto","Osaka","Hyogo","Nara","Wakayama"]

function getBase64(img, callback) {
	const reader = new FileReader();
	reader.addEventListener('load', () => callback(reader.result));
	reader.readAsDataURL(img);
}

export class PostPhoto extends Component {
    constructor(props) {
        super(props);
        this.state = {
            loading: false,
            coverGeoLat: '',
            coverGeoLng: '',
            tags: [],
            inputVisible: false,
            inputValue: '',
        };
    }
    
    beforeUpload = (file) => {
        let fileExtensionFlag = true
        const isJPG = file.type === 'image/jpeg'
        const isPNG = file.type === 'image/png'
        if (!isJPG && !isPNG) {
                message.error('You can only upload JPG/PNG file!');
            fileExtensionFlag = false
        }
        const isLt2M = file.size / 1024 / 1024 < 20;
        if (!isLt2M) {
            message.error('Image must smaller than 20MB!');
        }
        if(fileExtensionFlag && isLt2M){
            EXIF.getData(file,function(){
                const aLat = EXIF.getTag(file, "GPSLatitude")
                const aLong = EXIF.getTag(file, "GPSLongitude")
    
                if (aLat && aLong){
                    const strLatRef = EXIF.getTag(file, "GPSLatitudeRef") || "N";
                    const strLongRef = EXIF.getTag(file, "GPSLongitudeRef") || "W";
                    const fLat = (aLat[0] + aLat[1]/60 + aLat[2]/3600) * (strLatRef === "N" ? 1 : -1);
                    const fLong = (aLong[0] + aLong[1]/60 + aLong[2]/3600) * (strLongRef === "W" ? -1 : 1);

                    axios.get(`${config.SERVER_URL}/getPrefectureName?lat=${fLat}&lng=${fLong}`)
                    .then((response) => {
                        const prefectureFromPhoto = response.data.results[0].formatted_address.split(",")[0].split(" ")[0]
                        
                        this.setState({
                            coverGeoLat: fLat,
                            coverGeoLng: fLong,
                        })

                        const takenTime = file.exifdata.DateTimeOriginal.split(' ')[0].split(':')

                        this.props.form.setFieldsValue({
                            prefecture: prefectureFromPhoto,
                            prefectureId: prefectures.indexOf(prefectureFromPhoto) +1,
                            scopeDate: moment(`${takenTime[0]}-${takenTime[1]}-${takenTime[2]}`)
                        })
                    })

                }else{
                    this.setState({
                        coverGeoLat: '',
                        coverGeoLng: ''
                    })
                }
            }.bind(this))
        }
        return fileExtensionFlag && isLt2M;
    }

    handleChange = (info) => {//upload cover image
		if (info.file.status === 'uploading') {
			this.setState({ loading: true });
			return;
		}
		if (info.file.status === 'done') {
			getBase64(info.file.originFileObj, imageUrl => this.setState({
				imageUrl,
				loading: false
            }));
            this.props.form.setFieldsValue({
                coverPath: info.file.response.imgFilename
            })
		}
    }
    
    handleLatChange = (e) => {
        this.setState({
            coverGeoLat: e.target.value
        })
    }
    handleLngChange = (e) => {
        this.setState({
            coverGeoLng: e.target.value
        })
    }

    handlePrefectureChange = (value) => {
        console.log(value)
        this.props.form.setFieldsValue({
            prefectureId: prefectures.indexOf(value) +1
        })
    }

    handleTagClose = (removedTag) => {
        const tags = this.state.tags.filter(tag => tag !== removedTag);
        //console.log(tags);
        this.setState({ tags });
    }
    showTagInput = () => {
        this.setState({ inputVisible: true }, () => this.input.focus());
    }
    handleTagInputChange = (e) => {
        this.setState({ inputValue: e.target.value });
    }
    handleTagInputConfirm = () => {
        const state = this.state;
        const inputValue = state.inputValue;
        let tags = state.tags;
        if (inputValue && tags.indexOf(inputValue) === -1) {
            tags = [...tags, inputValue];
        }
        //console.log(tags);
        this.setState({
            tags,
            inputVisible: false,
            inputValue: '',
        });
    }
    saveInputRef = input => this.input = input

    handleSubmit = (e) => {
        e.preventDefault()
        this.props.form.validateFieldsAndScroll((err, values) => {
            if (!err) {
                const postData = {
                    userId: values.userId,
                    articleType: 1,
                    title: values.title,
                    coverPath: values.coverPath,
                    prefectureId: values.prefectureId,
                    lat: this.state.coverGeoLat,
                    lng: this.state.coverGeoLng,
                    scopeDateStart: `${moment(values.scopeDate[0]).toObject().years}-${moment(values.scopeDate[0]).toObject().months+1}-${moment(values.scopeDate[0]).toObject().date}`,
                    tags: JSON.stringify(this.state.tags)
                }
                axios.post(`${config.SERVER_URL}/article`, postData).then((response)=>{
                    if(response.status === 200){
                        this.props.history.push("/")
                    }
                })
            }
        });
    }

    render() {
        const { imageUrl, coverGeoLat, coverGeoLng, tags, inputVisible, inputValue } = this.state
        const { getFieldDecorator } = this.props.form
        const uploadButton = (
            <div>
                <Icon type={this.state.loading ? 'loading' : 'plus'} />
                <div className="ant-upload-text">Upload</div>
            </div>
        );
        const formItemLayout = {
            labelCol: {
              xs: { span: 24 },
              sm: { span: 4 },
            },
            wrapperCol: {
              xs: { span: 24 },
              sm: { span: 16 },
            },
        };
        return (
            <div className={ style.contentContainer }>
                <h2>Upload Photo</h2>
                <Form onSubmit={ this.handleSubmit } >
                    
                    {getFieldDecorator('userId', {
                        rules: [ { required: true, message: 'Please login' } ],
                        initialValue: this.props.userId
                    })(
                        <input type="hidden" />
                    )}
                    {getFieldDecorator('coverPath', {
                        initialValue: ''
                    })(
                        <input type="hidden" />
                    )}
                    {getFieldDecorator('prefectureId', {
                        initialValue: 0
                    })(
                        <input type="hidden" />
                    )}

                    <Form.Item
                        { ...formItemLayout }
                        label="Title"
                    >
                        {getFieldDecorator('title', {
                            rules: [ { required: true, message: 'Please input title of photo' } ],
                        })(
                        <Input />
                    )}
                    </Form.Item>

                    <Form.Item
                        {...formItemLayout}
                        label="Taken time"
                    >
                        {getFieldDecorator('scopeDate', {
                            rules: [ { required: true, message: 'Please select period of photo' } ]
                        })(
                            <DatePicker />
                        )}
                    </Form.Item>

                    <Form.Item
                        label="Main Photo"
                        {...formItemLayout}
                    >
                        {getFieldDecorator('coverPhoto', {
                            rules: [
                                { required: true, message: 'Please select a photo! ' }
                            ],
                        })(
                            <Upload
                                name="image"
                                listType="picture-card"
                                showUploadList={false}
                                action={`${config.SERVER_URL}/upload/img`}
                                beforeUpload={this.beforeUpload}
                                onChange={this.handleChange}
                            >
                            {imageUrl ? <img src={imageUrl} alt="main cover" className={ style.previewCover }/> : uploadButton}
                            </Upload>
                        )}
                        
                    </Form.Item>

                    <Form.Item
                        {...formItemLayout}
                        label="Prefecture"
                    >
                        {getFieldDecorator('prefecture', {
                            rules: [ { required: true, message: 'Please select prefecture of photo' } ],
                        })(
                            <Select
                                onChange={(value) => this.handlePrefectureChange(value)}
                            >
                                { prefectures.map((prefecture)=>{
                                    return [<Option value={prefecture}>{prefecture}</Option>]
                                }) }
                            </Select>
                        )}
                    </Form.Item>

                    <Form.Item
                        label="Geotag"
                        {...formItemLayout}
                        style={{ marginBottom: 0 }}
                    >
                        <Form.Item
                            style={{ display: 'inline-block', width: 'calc(50% - 12px)', marginRight: '3.5%' }}
                        >
                            <Input type="number" step="0.01" name="lat" placeholder="Latitude" value={ coverGeoLat } onChange={(e) => this.handleLatChange(e)} />
                        </Form.Item>
                        <Form.Item style={{ display: 'inline-block', width: 'calc(50% - 12px)' }}>
                            <Input type="number" step="0.01" name="lng" placeholder="Longitude" value={ coverGeoLng } onChange={(e) => this.handleLngChange(e)} />
                        </Form.Item>
                    </Form.Item>

                    <Form.Item
                        label="Tags"
                        {...formItemLayout}
                    >
                        {tags.map((tag, index) => {
                            const isLongTag = tag.length > 20;
                            const tagElem = (
                                <Tag className={ style.tagStyle } key={tag} closable afterClose={() => this.handleTagClose(tag)}>
                                    {isLongTag ? `${tag.slice(0, 20)}...` : tag}
                                </Tag>
                            );
                            return isLongTag ? <Tooltip title={tag} key={tag}>{tagElem}</Tooltip> : tagElem;
                        })}
                        {inputVisible && (
                            <Input
                                ref={this.saveInputRef}
                                type="text"
                                size="small"
                                style={{ width: 78 }}
                                value={inputValue}
                                onChange={this.handleTagInputChange}
                                onBlur={this.handleTagInputConfirm}
                                onPressEnter={this.handleTagInputConfirm}
                                className={ style.tagStyle }
                            />
                        )}
                        {!inputVisible && (
                            <Tag
                                onClick={this.showTagInput}
                                style={{ background: '#fff', borderStyle: 'dashed' }}
                                className={ style.tagStyleNew }
                            >
                                New Tag +
                            </Tag>
                        )}
                    </Form.Item>

                    <Form.Item className={ style.formItemSubmit }>
					    <Button size="large" type="primary" htmlType="submit" className={ style.submitBtn }>
							Post
					    </Button>
				    </Form.Item>
                </Form>
            </div>
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
})(PostPhoto);

function mapStateToProps(state){
    return {
        userId: state.authReducers.data.sub
    }
}

export default connect(mapStateToProps)(CustomizedForm)
