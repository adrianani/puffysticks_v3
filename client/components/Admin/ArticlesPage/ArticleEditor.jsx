import React, { Component } from 'react';
import {Link, withRouter} from "react-router-dom";
import {connect} from "react-redux";
import LangList from "../LanguagesPage/LangList";
import FormInput from "../../Helpers/FormInput";
import FormTextarea from "../../Helpers/FormTextarea";
import FormDropdown from "../../Helpers/FormDropdown";
import GalleryUploader from "../../Helpers/GalleryUploader/GalleryUploader";
import FormToggle from "../../Helpers/FormToggle";

class ArticleEditor extends Component {

     constructor(props) {
            super(props);

            this.state = {
                loading : true,

                languages : [],
                defaultLanguage : null,
                selectedLanguage : ``,

                categories : [],
                selectedCategory : ``,

                _id : ``,

                thumbnail : ``,
                images : [],

                similarWork : false,
                hasDemo : false,
                demo : ``,

                title : {},
                description : {}
            };
     }

     handleResponse = ({success, errors}) => {
         if (!success) {
             this.props.addError(errors);
         } else {
             this.props.history.push("/admin/articles");
         }
     }

     submit = e => {
         e.preventDefault();
         let article = {
             _id : this.state._id,
             category : this.state.selectedCategory,
             similarWork : this.state.similarWork,
             demo : this.state.hasDemo ? this.state.demo : '',
             title : this.state.title,
             description : this.state.description,
             thumbnail : this.state.thumbnail,
             images : this.state.images.filter(img => img._id !== this.state.thumbnail).map(img => img._id)
         };

         let {articleId} = this.props.match.params;

         if (articleId === undefined) {
             this.props.socket.emit("post article", {article}, this.handleResponse);
         } else {
             this.props.socket.emit("put article", {article}, this.handleResponse);
         }
     }

    delete = () => {
        let {socket} = this.props;
        let {articleId} = this.props.match.params;
        if (!articleId) return;

        socket.emit(`delete article`, {articleId}, this.handleResponse);
    }

    getDeleteBtn = () => {
        let {articleId} = this.props.match.params;
        if (!articleId) return null;

        return (
            <button
                className={`btn`}
                onClick={e => {
                    e.preventDefault();
                    this.props.addIrreversibleConfirmation({accept : this.delete});
                }}
            >
                {this.props.Lang.getWord("delete")}
            </button>
        );
    }

    get title() {
        let {articleId} = this.props.match.params;
        if (!articleId) return this.props.Lang.getWord("add_article");
        return this.props.Lang.getWord("edit_article");
    }

    get selectedLanguage () {
        return this.state.selectedLanguage || this.state.defaultLanguage;
    }

    selectLanguage = selectedLanguage => this.setState({selectedLanguage});

    updateLanguages = ({success, res, errors}) => {
        if (success) {
            this.setState(
                {languages : res.languages, defaultLanguage : res.defaultLanguage},
                () => this.refreshArticle()
            );
        } else {
            this.props.addError(errors);
        }
    }

    refreshLanguages = () => {
        this.props.socket.emit(`get all languages`, this.updateLanguages);
    }

    updateArticleTitleDesc = ({success, res, errors}) => {
        if (!success) {
            this.props.addError(errors);
            return;
        }

        let {articleId} = this.props.match.params;
        let title = {}, description = {};
        res.words.forEach(word => {
           if (word.key === `article_title_${articleId}`) {
               title[word.langid] = word.string;
           } else {
               description[word.langid] = word.string;
           }
        });

        this.setState({title, description, loading: false});
    }

    updateArticle = ({success, res, errors}) => {
        if (!success) {
            this.props.addError(errors);
            return;
        }

        let {articleId} = this.props.match.params;

        if (!articleId) {
            this.setState({_id : res.article._id});
        } else {
            this.setState({
                _id : res.article._id,
                hasDemo : (res.article.demo !== ``),
                demo : res.article.demo,
                similarWork : res.article.similarWork,
                selectedCategory : res.article.category
            });
        }

    }

    refreshArticle = () => {
        let {articleId} = this.props.match.params;
        let {languages} = this.state;

        if (!articleId) {
            let title = {}, description = {};
            languages.forEach(lang => {
                title[lang._id] =  ``;
                description[lang._id] = ``;
            });

            this.setState({title, description, loading: false});
        } else {
            this.props.socket.emit(`get word in all languages`, {keys : [`article_title_${articleId}`, `article_description_${articleId}`]}, this.updateArticleTitleDesc);
        }
        this.props.socket.emit(`get article`, {articleId}, this.updateArticle);
    }

    updateCategories = ({success, res, errors}) => {
        if (!success) {
            this.props.addError(errors);
        } else {
            let categories = res.categories.map(category => {
               return {
                   value : category._id,
                   text : this.props.Lang.getWord(`category_title_${category._id}`)
               }
            });
            this.setState({categories});
        }
    }

    refreshCategories = () => {
        this.props.socket.emit(`get all categories`, this.updateCategories);
    }

    componentDidMount() {
        this.refreshLanguages();
        this.refreshCategories();
    }

    getLangList = () => {
        return (
            <LangList
                languages = {this.state.languages}
                selectedLanguage = {this.selectedLanguage}
                selectLanguage = {this.selectLanguage}
            />
        );
    }

    updateArticleTitle = newTitle => {
        let {title} = this.state;
        title[this.selectedLanguage] = newTitle;
        this.setState({title});
    }

    updateArticleDescription = newDescription => {
        let {description} = this.state;
        description[this.selectedLanguage] = newDescription;
        this.setState({description});
    }

    pushImage = image => this.setState({images : [...this.state.images, image]});

    removeImage = imageId => {
        let {images, thumbnail} = this.state;
        if (imageId === thumbnail) thumbnail = ``;
        this.setState({images : images.filter(img => img._id !== imageId), thumbnail});
    }

    selectThumbnail = thumbnail => this.setState({thumbnail});

    getImages = () => {
        let {images, thumbnail} = this.state;
        let content = null;
        if (!images.length) {
            content = (
                <span>
                    {this.props.Lang.getWord(`article_no_images_uploaded`)}
                </span>
            );
        } else {
            content = images.map(image => {
                let selected = image._id === thumbnail ? ' selected' : '';
               return (
                   <div
                       key={image._id}
                       className={`article-editor-images-item${selected}`}
                   >
                       <div
                           className={`image`}
                           style={{
                               backgroundImage : `url("/${image.url}")`
                           }}
                           onClick={() => this.selectThumbnail(image._id)}
                       />
                       <i
                           className={`pufficon-cross close-btn`}
                           onClick={() => this.removeImage(image._id)}
                       />
                   </div>
               );
            });
        }

        return (
            <ul className={`article-editor-images-list`}>
                {content}
            </ul>
        );
    }

    getDemoInput = () => {
        let {hasDemo} = this.state;
        if (!hasDemo) return null;

        return (
            <FormInput
                label = {this.props.Lang.getWord("article_demo_url")}
                value = {this.state.demo || ""}
                onChange = {v => this.setState({demo : v})}
                darkTheme = {true}
            />
        );
    }

     render() {
        if (this.state.loading) return null;

          return (
              <div className={`Admin-inner-page`}>
                   <div className={`Admin-editor Article-editor`}>
                       <h1>{this.title}</h1>
                       {this.getLangList()}

                       <form onSubmit={this.submit}>
                           <div className={`form-group`}>
                               <div className={`form-group-label`}>
                                   <label>
                                       {this.props.Lang.getWord("article_images")}
                                   </label>
                               </div>
                               <GalleryUploader
                                   multiple = {true}
                                   onImageAdded = {this.pushImage}
                                   moreOptions = {
                                       {
                                           articleId : this.state._id,
                                           type : `thumbnail`
                                       }
                                   }
                               />

                               <div className={`form-group-label`}>
                                   <label>
                                       {this.props.Lang.getWord("article_pick_thumbnail")}
                                   </label>
                               </div>
                               {this.getImages()}
                           </div>
                           <FormInput
                               label = {this.props.Lang.getWord("article_name")}
                               description = {this.props.Lang.getWord("article_name_desc")}
                               value = {this.state.title[this.selectedLanguage] || ""}
                               onChange = {v => this.updateArticleTitle(v)}
                               darkTheme = {true}
                           />
                           <FormTextarea
                               label = {this.props.Lang.getWord("article_description")}
                               description = {this.props.Lang.getWord("article_description_desc")}
                               value = {this.state.description[this.selectedLanguage] || ""}
                               onChange = {v => this.updateArticleDescription(v)}
                               darkTheme = {true}
                           />
                           <FormDropdown
                               label = {this.props.Lang.getWord(`article_category`)}
                               description = {this.props.Lang.getWord(`article_category_desc`)}
                               options = {this.state.categories}
                               selectedOption = {this.state.selectedCategory}
                               selectOption = {selectedCategory => this.setState({selectedCategory})}
                           />
                           <FormToggle
                               label = {this.props.Lang.getWord('article_similar_work')}
                               description = {this.props.Lang.getWord('article_similar_work_desc')}
                               value = {this.state.similarWork}
                               onChange = {v => this.setState({similarWork : v})}
                           />
                           <FormToggle
                               label = {this.props.Lang.getWord('article_demo')}
                               description = {this.props.Lang.getWord('article_demo_desc')}
                               value = {this.state.hasDemo}
                               onChange = {v => this.setState({hasDemo : v})}
                           />
                           {this.getDemoInput()}

                           <div className={`btns-container`}>
                               <button
                                   className={`btn primary`}
                                   onClick={this.submit}
                               >
                                   {this.props.Lang.getWord('submit')}
                               </button>
                               {this.getDeleteBtn()}
                               <Link to={`/admin/articles`} className={`empty btn`}>
                                   {this.props.Lang.getWord('cancel')}
                               </Link>
                           </div>
                       </form>
                   </div>
              </div>
          );

     }

}

const mapStateToProps = state => {
    return {
        socket : state.socket,
        Lang : state.lang
    }
}

const mapDispatchToProps = dispatch => {
    return {
        addError : error => dispatch({type : "ADD_ERROR", error}),
        addIrreversibleConfirmation : (funcs) => dispatch({type : "ADD_IRREVERSIBLE_CONFIRMATION", ...funcs})
    }
}

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(ArticleEditor));