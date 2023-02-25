import ejs from 'ejs'

import config from './package.json'

let Gitalk, Valine, Artalk
loadScript(COMMENT_CHOOSEN)

const defaultChoosen = 'comment plugins'
console.log(
    `Current frontend version is ${config.dependencies.artalk} , plugin version is ${config.name}@v${config.version} , more details:`,
    config.homepage
)

/**
 * Lazy load pkg
 *
 * @param {String} name
 */
export function loadScript(name) {
    if (name === 'valine') {
        import('valine')
            .then(pkg => Valine = pkg.default)
    } else if (name === 'gitalk') {
        import('gitalk/dist/gitalk.css')
            .then(() => import('gitalk'))
            .then(pkg => Gitalk = pkg.default)
    } else if (name === "artalk") {
        import('artalk/dist/Artalk.css')
            .then(() => import('./custom.css'))
            .then(() => import('artalk'))
            .then(pkg => Artalk = pkg.default)
    }
}

/**
 * Render ejs strings in configuration
 *
 * @param {Object} config
 * @param {Object} data
 */
export function renderConfig(config, data) {
    const result = {}

    Reflect.ownKeys(config)
        .forEach(key => {
            if (typeof config[key] === 'string') {
                try {
                    result[key] = ejs.render(config[key], data)
                } catch (error) {
                    console.warn(`Comment config option error at key named "${key}"`)
                    console.warn(`More info: ${error.message}`)
                    result[key] = config[key]
                }
            } else {
                result[key] = config[key]
            }
        })

    return result
}

/**
 * 定时监测，达到某个条件加上class
 *
 * @param sel 选择器
 * @param cls css类
 */
function watchButton(sel, cls) {
    const id = setInterval(function () {
        const ele = document.querySelector(sel)
        if (ele && ele.classList) {
            ele.classList.add(cls)
            clearInterval(id)
        }

    }, 500)
}


/**
 * Support Gitalk and so on.
 */
export const provider = {
    gitalk: {
        render(frontmatter, commentDomID) {
            const commentDOM = document.createElement('div')
            commentDOM.id = commentDomID

            const parentDOM = document.querySelector(COMMENT_CONTAINER)
            parentDOM.appendChild(commentDOM)

            const gittalk = new Gitalk(renderConfig(COMMENT_OPTIONS, {frontmatter}))
            gittalk.render(commentDomID)
        },
        clear(commentDomID) {
            const last = document.querySelector(`#${commentDomID}`)
            if (last) {
                last.remove()
            }
            return true
        }
    },

    valine: {
        render(frontmatter, commentDomID) {
            const commentDOM = document.createElement('div')
            commentDOM.id = commentDomID

            const parentDOM = document.querySelector(COMMENT_CONTAINER)
            parentDOM.appendChild(commentDOM)

            new Valine({
                ...renderConfig(COMMENT_OPTIONS, {frontmatter}),
                el: `#${commentDomID}`
            })
        },
        clear(commentDomID) {
            const last = document.querySelector(`#${commentDomID}`)
            if (last) {
                last.remove()
            }
            return true
        }
    },

    artalk: {
        render(frontmatter, commentDomID) {
            const commentDOM = document.createElement('div')
            commentDOM.id = commentDomID

            const parentDOM = document.querySelector(COMMENT_CONTAINER)
            parentDOM.appendChild(commentDOM)

            new Artalk({
                // ...renderConfig(COMMENT_OPTIONS, { frontmatter }),
                el: `#${commentDomID}`,
                pageKey: '', // 页面链接
                pageTitle: '', // 页面标题
                server: COMMENT_OPTIONS.server, // 后端地址
                site: COMMENT_OPTIONS.site,
            });

            if (COMMENT_OPTIONS.disableEmotion) {
                watchButton('.atk-plug-btn:nth-child(1)', "atk-plug-btn-emo-hidden")
            }

            if (COMMENT_OPTIONS.disablePicture) {
                watchButton('.atk-plug-btn:nth-child(2)', "atk-plug-btn-pic-hidden")
            }

            if (COMMENT_OPTIONS.disablePreview) {
                watchButton('.atk-plug-btn:nth-child(3)', "atk-plug-btn-pre-hidden")
            }
        },
        clear(commentDomID) {
            const last = document.querySelector(`#${commentDomID}`)
            if (last) {
                last.remove()
            }
            return true
        }
    }
}