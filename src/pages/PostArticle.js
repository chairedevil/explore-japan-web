import React, { Component } from 'react'
import { connect } from 'react-redux'
import axios from 'axios'
import moment from 'moment'
import EXIF from 'exif-js'
import { EditorState, convertToRaw } from 'draft-js';
import { Editor } from 'react-draft-wysiwyg';
import '../../node_modules/react-draft-wysiwyg/dist/react-draft-wysiwyg.css';

import { Form, Input, DatePicker, Select, Button, message, Icon, Upload, Tag, Tooltip } from 'antd';
import style from '../assets/css/pages/PostArticle.module.less'

import config from '../config'

const { Option } = Select
const { RangePicker } = DatePicker
const prefectures = ["Hokkaido","Aomori","Iwate","Miyagi","Akita","Yamagata","Fukushima","Ibaraki","Tochigi","Gunma","Saitama","Chiba","Tokyo","Kanagawa","Niigata","Toyama","Ishikawa","Fukui","Yamanashi","Nagano","Gifu","Shizuoka","Aichi","Mie","Shiga","Kyoto","Osaka","Hyogo","Nara","Wakayama","Japan"]

function getBase64(img, callback) {
	const reader = new FileReader();
	reader.addEventListener('load', () => callback(reader.result));
	reader.readAsDataURL(img);
}

export class PostArticle extends Component {
    constructor(props) {
        super(props);
        this.state = {
            editorState: EditorState.createEmpty(),
            loading: false,
            coverGeoLat: null,
            coverGeoLng: null,
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

                        this.props.form.setFieldsValue({
                            prefecture: prefectureFromPhoto,
                            prefectureId: prefectures.indexOf(prefectureFromPhoto) +1
                        })
                    })

                }else{
                    this.setState({
                        coverGeoLat: null,
                        coverGeoLng: null
                    })
                }
            }.bind(this))
        }
        return fileExtensionFlag && isLt2M;
    }

    onEditorStateChange = (editorState) => {
        this.setState({
            editorState,
        });
    };

    onUploadImage = (imageFile) => {//upload image in content
        const bodyFormData = new FormData()
        bodyFormData.append('image', imageFile)
        return new Promise((resolve, reject) => {
            axios({
                method: 'post',
                url: `${config.SERVER_URL}/upload/img`,
                data: bodyFormData,
                config: { headers: {'Content-Type': 'multipart/form-data' }}
            }).then(
                (response) => {
                    resolve({ data: { link: `${config.SERVER_URL}/img/${response.data.imgFilename}` } });
                }
            )
        })
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
        this.props.form.setFieldsValue({
            prefectureId: prefectures.indexOf(value) +1
        })
    }

    handleTagClose = (removedTag) => {
        const tags = this.state.tags.filter(tag => tag !== removedTag);
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
                //console.log(values)
                let time1 = null
                let time2 = null
                if(values.scopeDate !== undefined){
                    time1 = `${moment(values.scopeDate[0]).toObject().years}-${moment(values.scopeDate[0]).toObject().months+1}-${moment(values.scopeDate[0]).toObject().date}`
                    time2 = `${moment(values.scopeDate[1]).toObject().years}-${moment(values.scopeDate[1]).toObject().months+1}-${moment(values.scopeDate[1]).toObject().date}`
                }
                const rawDraftContentState = JSON.stringify(convertToRaw(this.state.editorState.getCurrentContent()))
                const postData = {
                    userId: values.userId,
                    articleType: values.articleType,
                    title: values.title,
                    coverPath: values.coverPath,
                    prefectureId: values.prefectureId,
                    content: rawDraftContentState,
                    lat: this.state.coverGeoLat,
                    lng: this.state.coverGeoLng,
                    scopeDateStart: time1,
                    scopeDateEnd: time2,
                    tags: JSON.stringify(this.state.tags)
                }
                console.log(postData)
                axios.post(`${config.SERVER_URL}/article`, postData).then((response)=>{
                    if(response.status === 200){
                        this.props.history.push("/")
                    }
                })
            }
        });
    }

    render() {
        const { editorState, imageUrl, coverGeoLat, coverGeoLng, tags, inputVisible, inputValue } = this.state
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
                <h2>Upload Article</h2>
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
                        {...formItemLayout}
                        label="Post's Category"
                    >
                        {getFieldDecorator('articleType', {
                            rules: [ { required: true, message: 'Please select category of post' } ],
                        })(
                            <Select>
                                <Option value="0">Article</Option>
                                <Option value="2">Event</Option>
                            </Select>
                        )}
                    </Form.Item>

                    <Form.Item
                        { ...formItemLayout }
                        label="Title"
                    >
                        {getFieldDecorator('title', {
                            rules: [ { required: true, message: 'Please input title of post' } ],
                        })(
                        <Input />
                    )}
                    </Form.Item>

                    <Form.Item
                        {...formItemLayout}
                        label="Post's Period"
                    >
                        {getFieldDecorator('scopeDate', {
                            rules: [ { type: 'array' } ]
                        })(
                            <RangePicker />
                        )}
                    </Form.Item>

                    <Form.Item
                        label="Main Photo"
                        {...formItemLayout}
                    >
                        {getFieldDecorator('coverPhoto', {
                            rules: [
                                { required: true, message: 'Please select main photo! ' }
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
                            rules: [ { required: true, message: 'Please select prefecture of post' } ],
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

                    <Editor
                        editorState={editorState}
                        onEditorStateChange={this.onEditorStateChange}
                        editorClassName={style.editorClass}
                        toolbarClassName={style.toolbarClass}
                        toolbar={{
                            options: ['inline', 'blockType', 'list', 'textAlign', 'link', 'image' ],
                            inline: {
                                className: style.inlineStyle,
                                options: ['bold', 'italic', 'underline', 'strikethrough' ],
                            },
                            blockType: {
                                options: ['Normal', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'Blockquote', 'Code'],
                                className: style.blockType,
                                dropdownClassName: style.blockTypeDropdown,
                            },
                            list: {
                                className: style.list,
                                options: ['unordered', 'ordered'],
                            },
                            textAlign: {
                                className: style.textAlign,
                                options: ['left', 'center', 'right'],
                            },
                            link: {
                                className: style.link,
                                popupClassName: style.linkPopup,
                                showOpenOptionOnHover: true,
                                defaultTargetOption: '_self',
                                options: ['link', 'unlink'],
                            },
                            image: {
                                className: style.image,
                                popupClassName: style.imagePopup,
                                urlEnabled: true,
                                uploadEnabled: true,
                                alignmentEnabled: true,
                                uploadCallback: this.onUploadImage,
                                previewImage: true,
                                inputAccept: 'image/gif,image/jpeg,image/jpg,image/png,image/svg',
                                alt: { present: false, mandatory: false },
                                defaultSize: {
                                height: 'auto',
                                width: '100%',
                                },
                            },
                        }}
                    />
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
})(PostArticle);

function mapStateToProps(state){
    return {
        userId: state.authReducers.data.sub
    }
}

export default connect(mapStateToProps)(CustomizedForm)
