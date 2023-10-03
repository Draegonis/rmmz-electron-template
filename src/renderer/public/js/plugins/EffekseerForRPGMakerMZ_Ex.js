//==============================================================================
// EffekseerForRPGMakerMZ_Ex.js
// -----------------------------------------------------------------------------
// This software is released under the MIT License.
// http://opensource.org/licenses/mit-license.php
// -----------------------------------------------------------------------------
// [GitHub] : https://github.com/effekseer/EffekseerForRPGMakerMZ_Ex
//==============================================================================

/*:
 * @target MZ
 * @url https://github.com/effekseer/EffekseerForRPGMakerMZ_Ex
 * @plugindesc Effekseer Extended plugin v1.70e - 1.05
 * @author Effekseer
 *
 * @help
 * It is a plugin to extend the functionality of Effekseer.
 * Optimize a performance.
 *
 * Change it if you want to use a large amount of effects that can't be displayed.
 *
 * @param InstanceMaxCount
 * @desc The maximum number of instances that can be displayed at one time.
 * @type number
 * @default 10000
 *
 * @param SquareMaxCount
 * @desc The maximum number of sprites that can be displayed at one time.
 * @type number
 * @default 10000
 *
 * @param DistortionEnabled
 * @desc Enables/disables effect distortion.
 * @type boolean
 * @default false
 *
 * @param IMPORT_AS_MODULE
 * @text Import as Module
 * @type boolean
 * @default true
 * 
 */
/*:ja
 * @target MZ
 * @url https://github.com/effekseer/EffekseerForRPGMakerMZ_Ex
 * @plugindesc Effekseer 拡張プラグイン v1.70e - 1.05
 * @author Effekseer
 *
 * @help
 * Effekseer の機能を拡張するプラグインです。
 * パフォーマンスを最適化します。
 *
 * 表示しきれない多量のエフェクトを使う場合は変更してください。
 *
 * @param InstanceMaxCount
 * @desc 一度に表示できるインスタンスの最大数。
 * @type number
 * @default 10000
 *
 * @param SquareMaxCount
 * @desc 一度に表示できるスプライトの最大数。
 * @type number
 * @default 10000
 *
 * @param DistortionEnabled
 * @desc エフェクトの歪みを有効にするかどうか。
 * @type boolean
 * @default false
 * 
 * @param IMPORT_AS_MODULE
 * @text Import as Module
 * @type boolean
 * @default true
 *
 */

await window.loadPluginJs('EffekseerForRPGMakerMZ_Ex')
