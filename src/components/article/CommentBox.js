import React, { Component } from 'react'
import { connect } from 'react-redux'
import config from '../../config'
import axios from 'axios'
import { Card, Comment, Avatar, Form, Button, List, Input } from 'antd'
import style from '../../assets/css/components/CommentBox.module.less'
import moment from 'moment'

const TextArea = Input.TextArea


const CommentList = ({ comments }) => (
    <List
        dataSource={comments}
        header={`${comments.length} ${comments.length > 1 ? 'replies' : 'reply'}`}
        itemLayout="horizontal"
        renderItem={({author, avatar, datetime, content}) => <Comment
            author={author}
            //avatar={`../assets/avatar/${avatar}`}
            avatar={<Avatar size={40} className={ style.avatar } src={`${config.SERVER_URL}/avatar/${avatar}`} />}
            datetime={ moment(datetime).fromNow() }
            content={content}
        />}
    />
);

const Editor = ({
    onChange, onSubmit, submitting, value,
  }) => (
    <div>
        <Form.Item className={ style.commentBox }>
            <TextArea rows={2} onChange={onChange} value={value} />
        </Form.Item>
        <Form.Item className={ style.commentSubmit }>
            <Button
                htmlType="submit"
                loading={submitting}
                onClick={onSubmit}
                type="primary"
            >
                Comment
            </Button>
        </Form.Item>
    </div>
);

export class CommentBox extends Component {
    constructor(props) {
        super(props)

        this.state = {
            comments: [],
            submitting: false,
            value: '',
        }
    }

    componentWillReceiveProps(nextProps){
        if(nextProps.comments !== this.props.comments){
            this.setState({
                comments: nextProps.comments
            })
        }
    }
    
    handleSubmit = () => {
        if (!this.state.value) {
            return;
        }
    
        this.setState({
            submitting: true,
        });
    
        const postData = {
            userId: parseInt(this.props.data.sub),
            articleId: parseInt(this.props.articleId),
            content: this.state.value
        }

        //console.log(postData)
        axios.post(`${config.SERVER_URL}/comment`, postData).then((response)=>{
            if(response.status === 200){

                setTimeout(() => {
                    this.setState({
                        submitting: false,
                        value: '',
                        comments: [
                            {
                                author: this.props.data.username,
                                avatar: `${this.props.data.avaPath}`,
                                content: this.state.value,
                                //datetime: String(moment().fromNow()),
                                datetime: moment(),
                            },
                            ...this.state.comments,
                        ],
                    });
                }, 1000);

            }
        })

    }
    
    handleChange = (e) => {
        this.setState({
            value: e.target.value,
        });
    }


    render() {
        const { comments, submitting, value } = this.state
        return (
            <Card className={ style.contentContainerInner }>
                {this.props.authenticated && (
                    <Comment
                    avatar={(
                        <Avatar
                            src={`${config.SERVER_URL}/avatar/${ this.props.data.avaPath }`}
                            alt={this.props.data.username}
                            size={60}
                            className={ style.avatar }
                        />
                    )}
                    content={(
                      <Editor
                        onChange={this.handleChange}
                        onSubmit={this.handleSubmit}
                        submitting={submitting}
                        value={value}
                      />
                    )}
                  />
                )}
                {comments.length > 0 && <CommentList comments={comments} />}
            </Card>
        )
    }
}

function mapStateToProps(state) {
    return {
        authenticated: state.authReducers.authenticated,
        data: state.authReducers.data
    }
}

export default connect(mapStateToProps)(CommentBox)
