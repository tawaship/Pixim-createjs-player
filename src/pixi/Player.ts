import { IAnimateLibrary, prepareAnimate, IPrepareOption, loadAssetAsync, ILoadAssetOption, ITickerData } from '@tawaship/pixi-animate-core';
import { initStage } from '../common/core';
import * as _PIXI from 'pixi.js';

/**
 * @ignore
 */
declare const window: any;

namespace PIXI {
	export namespace animate {
		export class Player {
			private _app: _PIXI.Application;
			private _id: string;
			private _rootClass: any;
			private _basepath: string;
			private _stage: any;
			
			/**
			 * @param id "lib.properties.id" in Animate content.
			 * @param rootName Root class name of Animate content.
			 * @param basepath Directory path of Animate content.
			 * @param options {{https://tawaship.github.io/pixi-animate-core/interfaces/iprepareoption.html | PixiAnimateCore.IPrepareOption}}
			 * @param pixiOptions Options of [[http://pixijs.download/release/docs/PIXI.Application.html | PIXI.Application]].
			 */
			constructor(id: string, rootName: string, basepath: string, options: IPrepareOption = {}, pixiOptions: Object = {}) {
				const comp = window.AdobeAn.getComposition(id);
				if (!comp) {
					throw new Error('no composition');
				}
				
				const lib: IAnimateLibrary = comp.getLibrary();
				const root = lib[rootName];
				if (!root) {
					throw new Error('no root class');
				}
				
				const prop = lib.properties;
				
				this._app = new _PIXI.Application(Object.assign(pixiOptions, {
					width: prop.width,
					height: prop.height,
					backgroundColor: parseInt(prop.color.slice(1), 16)
				}));
				
				document.body.appendChild(this._app.view);
				this._app.stop();
				this._app.render();
				
				this._id = id;
				this._rootClass = root;
				this._basepath = basepath;
				
				window.createjs.Ticker.framerate = prop.fps;
				
				this._handleTick = this._handleTick.bind(this);
				
				prepareAnimate(options);
				initStage(options);
			}
			
			/**
			 * Prepare createjs content published with Adobe Animate.
			 * 
			 * [[https://tawaship.github.io/pixi-animate-core/interfaces/iloadassetoption.html | PixiAnimateCore.ILoadAssetOption]]
			 */
			prepareAsync(options: ILoadAssetOption = {}) {
				return loadAssetAsync(this._id, this._basepath, options)
					.then((lib: IAnimateLibrary) => {
						const exportRoot = new this._rootClass();
						
						this._stage = new lib.Stage();
						
						Object.defineProperties(window, {
							exportRoot: {
								value: exportRoot
							},
							
							stage: {
								value: this._stage
							}
						});
						
						window.AdobeAn.compositionLoaded(lib.properties.id);
						
						this._stage.addChild(exportRoot);
						
						this._app.stage.addChild(exportRoot.pixi);
						
						return lib;
					});
			}
			
			play() {
				window.createjs.Ticker.addEventListener('tick', this._handleTick);
				
				return this;
			}
			
			stop() {
				window.createjs.Ticker.removeEventListener('tick', this._handleTick);
				
				return this;
			}
			
			private _handleTick(e: ITickerData) {
				this._stage.updateForPixi(e);
				this.app.render();
			}
			
			get app(): _PIXI.Application {
				return this._app;
			}
		}
	}
}

/**
 * @ignore
 */
export import Player = PIXI.animate.Player;