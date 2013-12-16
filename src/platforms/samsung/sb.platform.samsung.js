/**
 * Samsung platform
 */
!(function ( window, undefined  ) {

	var platform = new window.SB.Platform('samsung'),
		/**
		 * Native plugins
		 * @type {{id: clsid}} id - DOM element id
		 */
			plugins = {
			audio: 'SAMSUNG-INFOLINK-AUDIO',
			pluginObjectTV: 'SAMSUNG-INFOLINK-TV',
			pluginObjectTVMW: 'SAMSUNG-INFOLINK-TVMW',
			pluginObjectNetwork: 'SAMSUNG-INFOLINK-NETWORK',
			pluginObjectNNavi: 'SAMSUNG-INFOLINK-NNAVI'
		},
		platformObj,
		detectResult = false;

	detectResult = navigator.userAgent.search(/Maple/) > -1;

	// non-standart inserting objects in DOM (i'm looking at you 2011 version)
	// in 2011 samsung smart tv's we can't add objects if document is ready
	if (detectResult) {
		var objectsString = '';
		for ( var id in plugins ) {
			objectsString += '<object id=' + id +' border=0 classid="clsid:' + plugins[id] +'" style="opacity:0.0;background-color:#000000;width:0px;height:0px;"></object>';
		}
		document.write(objectsString);
	}

	platformObj = {

		keys: {

		},

		externalJs: [
			'$MANAGER_WIDGET/Common/af/../webapi/1.0/deviceapis.js',
			'$MANAGER_WIDGET/Common/af/../webapi/1.0/serviceapis.js',
			'$MANAGER_WIDGET/Common/af/2.0.0/extlib/jquery.tmpl.js',
			'$MANAGER_WIDGET/Common/Define.js',
			'$MANAGER_WIDGET/Common/af/2.0.0/sf.min.js',
			'$MANAGER_WIDGET/Common/API/Widget.js',
			'$MANAGER_WIDGET/Common/API/TVKeyValue.js',
			'$MANAGER_WIDGET/Common/API/Plugin.js',
			'src/platforms/samsung/localstorage.js'
		],

		$plugins: {},

		detect: function () {
			return detectResult;
		},

		initialise: function () {},

		getNativeDUID: function () {
			return this.$plugins.pluginObjectNNavi.GetDUID(this.getMac());
		},

		getMac: function () {
			return this.$plugins.pluginObjectNetwork.GetMAC();
		},

		getSDI: function () {
			this.SDI = this.SDIPlugin.Execute('GetSDI_ID');
			return this.SDI;
		},

		/**
		 * Return hardware version for 2013 samsung only
		 * @returns {*}
		 */
		getHardwareVersion: function () {
			var version = this.firmware.match(/\d{4}/) || [];
			if (version[0] === '2013') {
				this.hardwareVersion = sf.core.sefplugin('Device').Execute('Firmware');
			} else {
				this.hardwareVersion = null;
			}
			return this.hardwareVersion;
		},

		setPlugins: function () {
			var self = this;

			_.each(plugins, function ( clsid, id ) {
				self.$plugins[id] = document.getElementById(id);
			});

			this.$plugins.SDIPlugin = sf.core.sefplugin('ExternalWidgetInterface');
			this.$plugins.tvKey = new Common.API.TVKeyValue();

			var NNAVIPlugin = this.$plugins.pluginObjectNNavi,
				TVPlugin = this.$plugins.pluginObjectTV;

			$$log('Plugin  nnavi ' + NNAVIPlugin);

			this.modelCode = NNAVIPlugin.GetModelCode();
			this.firmware = NNAVIPlugin.GetFirmware();
			this.systemVersion = NNAVIPlugin.GetSystemVersion(0);
			this.productCode = TVPlugin.GetProductCode(1);

			this.pluginAPI = new Common.API.Plugin();
			this.widgetAPI = new Common.API.Widget();

			this.productType = TVPlugin.GetProductType();
			this.initStorage();

			// enable standart volume indicator
			this.pluginAPI.unregistKey(sf.key.KEY_VOL_UP);
			this.pluginAPI.unregistKey(sf.key.KEY_VOL_DOWN);
			this.pluginAPI.unregistKey(sf.key.KEY_MUTE);
			NNAVIPlugin.SetBannerState(2);
		},

		/**
		 * In 2011 window.localstorage is undefined
		 * In 2012 if app is deleted, localstorage for app is still enabled with old data
		 */
		initStorage: function () {

		},

		/**
		 * Start screensaver
		 * @param time
		 */
		enableScreenSaver: function (time) {
			time = time || false;
			sf.service.setScreenSaver(true, time);
		},

		/**
		 * Disable screensaver
		 */
		disableScreenSaver: function () {
			sf.service.setScreenSaver(false);
		},

		exit: function () {
			sf.core.exit(false);
		},

		blockNavigation: function () {
			sf.key.preventDefault();
		}
	};

	_.extend(platform, platformObj);
})(this);