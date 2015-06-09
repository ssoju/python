var Header = React.createClass({
    render: function () {
        return (
            <header className="bar bar-nav">
                <a href="#" className={"icon icon-left-nav pull-left" + (this.props.back==="true"?"":" hidden")}></a>
                <h1 className="title">{this.props.text}</h1>
            </header>
        );
    }
});

var SearchBar = React.createClass({
    searchHandler: function() {
        this.props.searchHandler(this.refs.searchKey.getDOMNode().value);
    },
    render: function () {
        return (
            <div className="bar bar-standard bar-header-secondary">
                <input type="search" ref="searchKey" onChange={this.searchHandler} value={this.props.searchKey}/>
            </div>

        );
    }
});

var BlogListItem = React.createClass({
    render: function () {
        return (
            <li className="table-view-cell media">
                <div>
					<a href={"#blog/" + this.props.blogId}>
						{this.props.blogId}.{this.props.blog.writer}
						<p>{this.props.blog.content.substr(0, 10)+'...'}</p>
					</a>
				</div>
            </li>
        );
    }
});

var BlogList = React.createClass({
    render: function () {
        var items = this.props.blogList.map(function (blog) {
            return (
                <BlogListItem key={blog.pk} blogId={blog.pk} blog={blog.fields} />
            );
        });
        return (
            <ul  className="table-view">
                {items}
            </ul>
        );
    }
});

var HomePage = React.createClass({
    getInitialState: function() {
        return {blogList: []};
    },
    componentDidMount: function() {
        this.props.service.findByName().done(function(result) {
            this.setState({blogList: result});
        }.bind(this));
    },
    render: function () {
        return (
            <div className={"page " + this.props.position}>
                <Header text="Blog List" back="false"/>
                <div className="content">
                    <BlogList blogList={this.state.blogList}/>
                </div>
            </div>
        );
    }
});

var BlogPage = React.createClass({
    getInitialState: function() {
        return {blog: {}};
    },
    componentDidMount: function() {
        this.props.service.findById(this.props.blogId).done(function(result) {
            this.setState({blog: result[0].fields});
        }.bind(this));
    },
    render: function () {
		var content = (this.state.blog.content||'');//.replace(/\n/g, '<br />');
        return (
            <div className={"page " + this.props.position}>
                <Header text="Blog View" back="true"/>
                <div className="card">
					작성자: {this.state.blog.writer}<br /> 내용: {{__html: content}}
                </div>
				<CommentBox blogId={this.props.blogId}  url="/api/blog/comments" />		
            </div>
        );
    }
});

var Comment = React.createClass({
	render: function() {
		var rawMarkup = this.props.children.toString();
		return (
			<div className="comment" style={{border: '1px solid #ededed', marginBottom: 5}}>
				<h2 className="commentwriter">
					{this.props.writer}
				</h2>
				<span dangerouslySetInnerHTML={{__html: rawMarkup}} />
			</div>
		);
	}
});

function getCookie(name) {
    var cookieValue = null;
    if (document.cookie && document.cookie != '') {
        var cookies = document.cookie.split(';');
        for (var i = 0; i < cookies.length; i++) {
            var cookie = jQuery.trim(cookies[i]);
            // Does this cookie string begin with the name we want?
            if (cookie.substring(0, name.length + 1) == (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}
var csrftoken = getCookie('csrftoken');
$.ajaxSetup({
    beforeSend: function(xhr, settings) {
        if (!this.crossDomain) {
            xhr.setRequestHeader("X-CSRFToken", csrftoken);
        }
    }
});

var CommentBox = React.createClass({
  loadCommentsFromServer: function() {
    $.ajax({
      url: this.props.url,
      dataType: 'json',
      cache: false,
	  data: {
		blog_id: this.props.blogId
	  },
      success: function(data) {
        this.setState({data: data});
      }.bind(this),
      error: function(xhr, status, err) {
        console.error(this.props.url, status, err.toString());
      }.bind(this)
    });
  },
  handleCommentSubmit: function(comment) {
    var comments = this.state.data;
    comments.push(comment);
    //this.setState({data: comments}, function() {
      $.ajax({
        url: this.props.url,
        dataType: 'json',
        type: 'POST',
        data: comment,
        success: function(data) {
          this.setState({data: data});
        }.bind(this),
        error: function(xhr, status, err) {
          console.error(this.props.url, status, err.toString());
        }.bind(this)
      });
    //});
  },
  getInitialState: function() {
    return {data: []};
  },
  componentDidMount: function() {
    this.loadCommentsFromServer();
    //setInterval(this.loadCommentsFromServer, this.props.pollInterval);
  },
  render: function() {
    return (
      <div className="commentBox">
        <h1>Comments</h1>
        <CommentList blogId={this.props.blogId} data={this.state.data} />
        <CommentForm blogId={this.props.blogId} onCommentSubmit={this.handleCommentSubmit} />
      </div>
    );
  }
});

var CommentList = React.createClass({
  render: function() {
    var commentNodes = this.props.data.map(function(comment, index) {
		console.log(comment);
      return (
        <Comment writer={comment.fields.writer} key={index}>
          {comment.fields.content}
        </Comment>
      );
    });
    return (
      <div className="commentList">
        {commentNodes}
      </div>
    );
  }
});

var CommentForm = React.createClass({
  handleSubmit: function(e) {
    e.preventDefault();
    var writer = React.findDOMNode(this.refs.writer).value.trim();
    var content = React.findDOMNode(this.refs.content).value.trim();
    if (!content || !writer) {
      return;
    }
    this.props.onCommentSubmit({blog_id: this.props.blogId, writer: writer, content: content});
    React.findDOMNode(this.refs.writer).value = '';
    React.findDOMNode(this.refs.content).value = '';
  },
  render: function() {
    return (
      <form className="commentForm" onSubmit={this.handleSubmit}>
        <input type="text" placeholder="Your name" ref="writer" />
        <input type="text" placeholder="Say something..." ref="content" />
        <input type="submit" value="Post" />
      </form>
    );
  }
});

/*React.render(
  <CommentBox url="comments.json" pollInterval={2000} />,
  document.getElementById('content')
);*/


var App = React.createClass({
    mixins: [PageSlider],
    getInitialState: function() {
        return {
            searchKey: ''
        }
    },
    searchHandler: function(searchKey) {
        blogService.findByName(searchKey).done(function(blog) {
            this.setState({
                searchKey:searchKey,
                blog: blog,
                pages: [<HomePage key="list" searchHandler={this.searchHandler} searchKey={searchKey} blog={blog} service={blogService}/>]});
        }.bind(this));
    },
    componentDidMount: function() {
		var me = this,
			list = [];
		
		router.addRoute('', function() {
			me.slidePage(<HomePage key="list" searchHandler={me.searchHandler} searchKey={me.state.searchKey} service={blogService}/>);
        });
        router.addRoute('blog/:id', function(id) {
			me.slidePage(<BlogPage key="details" blogId={id} service={blogService}/>);
        });
        router.start();
    }
});

React.render(<App/>, document.body);