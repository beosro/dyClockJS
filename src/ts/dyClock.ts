/*!
 * dyClockJS is a JavaScript library for creating clock.
 *
 * Author: Yusuf Shakeel
 * https://github.com/yusufshakeel
 *
 * GitHub Link: https://github.com/yusufshakeel/dyClockJS
 *
 * MIT license
 * Copyright (c) 2016 Yusuf Shakeel
 *
 * Date: 2014-01-29 Wednesday
 */

/**
 * The dyClockJS class.
 */
class dyClock {

    // this is the default options
    private defaults = {

        // clock type
        clock: "digital",

        // for digital clock
        format: "HH:mm:ss",
        digitalStyle: {
            backgroundColor: "#fff",
            border: "none",
            fontColor: "#000",
            fontFamily: "Arial",
            fontSize: 16
        },

        // for analog clock
        hand: "hms",
        radius: 150,
        showdigital: false,
        image: false,
        analogStyle: {
            backgroundColor: "#fff",
            border: "none",
            handsColor: {
                h: "#000",
                m: "#000",
                s: "#000"
            },
            handsWidth: {
                h: 3,
                m: 2,
                s: 1
            },
            roundHands: false,
            shape: "circle"
        }
    };

    // target elements
    private target: string = '';
    private targetElemBy: string = '';
    private targetPrefix: string = '';

    // this holds the clock configuration options
    private clockOption: any;

    // this is to start/stop the clock ticking
    private tick: any;

    /**
     * This will create the dyClock object based on the configuration
     * options passed by the user.
     *
     * option = {
     *  clock : "string"    //(optional) values: "analog|digital|both" default: "digital"
     *  format : "string"   //(optional) values: "(hh|HH):mm(:ss) (a|A)" default: "HH:mm:ss"
     *  hand : "string"     //(optional) values: "hm(s)" applicable: analog clock
     *  image : "string"    //(optional) value: /path/to/image-file applicable: analog clock
     *  radius : integer    //(optional) values: integer min: 30px max: 150px applicable: analog clock
     *  showdigital : boolean   //(optional) values: true|false default: false applicable: analog clock
     * }
     *
     * @param target
     * @param options
     */
    constructor(target: string, options: any) {

        // checking target
        if (typeof target === "undefined") {
            console.error("target undefined");
            return;
        }

        // checking radius - applicable for analog clock
        if (typeof options !== "undefined" && typeof options.radius !== "undefined") {

            options.radius = Math.ceil(options.radius);

            if (options.radius < 30) {
                options.radius = 30;
            } else if (options.radius > this.defaults.radius) {
                options.radius = this.defaults.radius;
            }

        }

        // find target element by
        if (target[0] === "#") {
            this.targetElemBy = "id";
        } else if (target[0] === ".") {
            this.targetElemBy = "class";
        }

        // prefix to be used in clock elements creation
        this.targetPrefix = target.substring(1);

        // target element
        this.target = this.targetPrefix;

        /**
         * user configuration extends defaults configuration
         */
        this.clockOption = (typeof options !== "undefined") ? this.extendSource(options, this.defaults) : this.defaults;

        /**
         * to start stop clock
         */
        this.tick = null;

        /**
         * to set the clock options format like time string, time ocject
         */
        this.setClockOptionFormat();

    }

    /**
     * This will extend source object with defaults object.
     *
     * @param source     this is the source object
     * @param defaults   this is the default object
     * @return object
     */
    private extendSource(source: any, defaults: any) {
        let property;
        for (property in defaults) {
            if (source.hasOwnProperty(property) === false) {
                source[property] = defaults[property];
            }
        }
        return source;
    }

    /**
     * set clock options format
     */
    private setClockOptionFormat() {

        let
            obj = {
                hour: "",
                showMinutes: false,
                showSeconds: false
            },
            format,
            time,
            ampm;

        //split format
        format = this.clockOption.format.split(" ");

        //get time format from format
        time = format[0].split(":");

        //get am/pm format from format
        ampm = (typeof format[1] !== "undefined") ? format[1] : false;

        //set format time
        if (time[0] === "hh") {
            obj.hour = "12";
        } else if (time[0] === "HH") {
            obj.hour = "24";
        }

        obj.showMinutes = true;

        if (typeof time[2] !== "undefined" && time[2] === "ss") {
            obj.showSeconds = true;
        } else {
            obj.showSeconds = false;
        }

        this.clockOption.format_time = obj;

        //set format ampm
        if (ampm === false) {
            this.clockOption.format_showam = false;
        } else {
            //if lowercase am/pm then 0, else 1
            this.clockOption.format_showam = true;
            this.clockOption.format_showamvalue = (ampm === "a") ? ["am", "pm"] : ["AM", "PM"];
        }

    }

    /**
     * Get the current time.
     */
    private getTime() {

        let
            dateObj = new Date(),
            time = {
                hour: null,
                minute: null,
                second: null
            };

        // set current time
        time.hour = dateObj.getHours();
        time.minute = dateObj.getMinutes();
        time.second = dateObj.getSeconds();

        return time;

    }

    /**
     * This will return time string based on user option.
     *
     * @param timeData
     * @param clockOption
     * @return string
     */
    private getTimeString(timeData: any, clockOption: any) {

        let
            tmp,
            timeString = "";

        switch (clockOption.format_time.hour) {
            case "12":
                // set hour
                if (timeData.hour === 0) {
                    timeString = "12 ";
                } else if (timeData.hour > 12) {
                    tmp = (timeData.hour - 12);
                    timeString = (tmp < 10) ? "0" + tmp : tmp;
                } else {
                    timeString = (timeData.hour < 10) ? "0" + timeData.hour : timeData.hour;
                }

                break;

            case "24":
                // set hour
                timeString = (timeData.hour < 10) ? "0" + timeData.hour : timeData.hour;
                break;

            default:
                console.error("Invalid format: hour");
        }

        // set minute
        if (timeData.minute < 10) {
            timeString = timeString + " : 0" + timeData.minute;
        } else {
            timeString = timeString + " : " + timeData.minute;
        }

        // set second
        if (clockOption.format_time.showSeconds === true) {
            if (timeData.second < 10) {
                timeString = timeString + " : 0" + timeData.second;
            } else {
                timeString = timeString + " : " + timeData.second;
            }
        }

        // show am/pm
        if (clockOption.format_showam === true) {
            if (timeData.hour >= 12) {
                timeString = timeString + " " + clockOption.format_showamvalue[1];
            } else {
                timeString = timeString + " " + clockOption.format_showamvalue[0];
            }
        }

        return timeString;

    }

    /**
     * This will start the clock.
     */
    public start() {

        let self = this;

        if (this.clockOption.clock === "digital") {

            this.drawDigitalClock();
            this.tick = setInterval(function () {
                self.runDigitalClock();
            }, 1000);

        } else if (this.clockOption.clock === "analog") {

            // this.drawAnalogClock();
            // this.tick = setInterval(function () {
            //     self.runAnalogClock();
            // }, 1000);

        }

    }

    /**
     * This will stop the clock.
     */
    public stop() {
        clearInterval(this.tick);
    }

    /**
     * This will draw the digital clock.
     */
    private drawDigitalClock() {

        console.log(this.clockOption);

        console.log(this.target);
        console.log(this.targetElemBy);
        console.log(this.targetPrefix);

        // create the digital clock container
        let html = "<div class='" + this.targetPrefix + "-digital-time-string dyclock-digital-time'></div>";

        // draw clock
        if (this.targetElemBy === "id") {

            document.getElementById(this.target).innerHTML = html;

        } else if (this.targetElemBy === "class") {

            let elArr = document.getElementsByClassName(this.target);
            for (let i = 0, len = elArr.length; i < len; i++) {
                elArr[i].innerHTML = html;
            }

        }

        // style
        this.styleDigitalClock();

    }

    /**
     * Style the digital clock time string.
     */
    private styleDigitalClock() {

        let
            digitalStyle = this.clockOption.digitalStyle;

        /**
         * backgroundColor style
         */
        if (typeof digitalStyle.backgroundColor !== "undefined") {
            this.styleDigitalClock_setCSS('backgroundColor', digitalStyle.backgroundColor);
        } else {
            this.styleDigitalClock_setCSS('backgroundColor', this.defaults.digitalStyle.backgroundColor);
        }

        /**
         * border style
         */
        if (typeof digitalStyle.border !== "undefined") {
            this.styleDigitalClock_setCSS('border', digitalStyle.border);
        } else {
            this.styleDigitalClock_setCSS('border', this.defaults.digitalStyle.border);
        }

        /**
         * fontColor style
         */
        if (typeof digitalStyle.fontColor !== "undefined") {
            this.styleDigitalClock_setCSS('color', digitalStyle.fontColor);
        } else {
            this.styleDigitalClock_setCSS('color', this.defaults.digitalStyle.fontColor);
        }

        /**
         * fontFamily style
         */
        if (typeof digitalStyle.fontFamily !== "undefined") {
            this.styleDigitalClock_setCSS('fontFamily', digitalStyle.fontFamily);
        } else {
            this.styleDigitalClock_setCSS('fontFamily', this.defaults.digitalStyle.fontFamily);
        }

        /**
         * fontSize style
         */
        if (typeof digitalStyle.fontSize !== "undefined") {
            this.styleDigitalClock_setCSS('fontSize', digitalStyle.fontSize + 'px');
        } else {
            this.styleDigitalClock_setCSS('fontSize', this.defaults.digitalStyle.fontSize + 'px');
        }

    }

    /**
     * This is will set the CSS.
     * @param {string} property
     * @param {string | number} value
     */
    private styleDigitalClock_setCSS(property: string, value: string | number) {
        let elemArr = document.getElementsByClassName(this.target + "-digital-time-string");
        for (let i = 0, len = elemArr.length; i < len; i++) {
            (<HTMLElement>elemArr[i]).style[property] = value;
        }
    }

    /**
     * This will run the digital clock.
     */
    private runDigitalClock() {

        let elemArr = document.getElementsByClassName(this.target + "-digital-time-string");
        for (let i = 0, len = elemArr.length; i < len; i++) {
            (<HTMLElement>elemArr[i]).innerHTML = this.getTimeString(this.getTime(), this.clockOption);
        }

    };

}