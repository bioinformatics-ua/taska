/*!
 * jQuery DOM Line plugin v0.1.3
 * Copyright (c) 2011 Gilmore Davidson
 * https://gilmoreorless.github.com/jquery-dom-line/
 *
 * @license Open source under the MIT licence: http://gilmoreorless.mit-license.org/2011/
 */
;(function ($, undefined) {
    function checkPoint(point) {
        if (point.x === undefined && point.y === undefined) {
            return false;
        }
        point.x = parseFloat(point.x) || 0;
        point.y = parseFloat(point.y) || 0;
        return point;
    }

    var calcCache = {};
    function calcPosition(from, to, calc) {
        var cacheId = [from.x, from.y, to.x, to.y, calc.w, calc.h].join(',');
        if (calcCache[cacheId]) {
            return $.extend({}, calcCache[cacheId]);
        }
        // Calculate dimensions
        var xDiff = Math.abs(to.x - from.x),
            yDiff = Math.abs(to.y - from.y),
            hypot = (!xDiff || !yDiff) ? xDiff || yDiff : Math.sqrt(xDiff * xDiff + yDiff * yDiff),
            minX  = Math.min(from.x, to.x),
            minY  = Math.min(from.y, to.y),
            halfX = minX + xDiff / 2,
            halfY = minY + yDiff / 2,
            theta,
            left  = halfX - hypot / 2,
            top   = halfY,
            pos = calcCache[cacheId] = {
                width: hypot
            };

        // Account for width/height/margin offsets
        (calc.w > 1) && (pos.width -= (calc.w - 1));
        (calc.h > 1) && (top -= calc.h / 2);
        calc.bw && (left += calc.bw / 2);
        calc.bh && (top += calc.bh / 2);
        if (!$.support.matrixFilter) {
            left -= calc.l;
            top  -= calc.t;
        }
        left = Math.round(left);
        top  = Math.round(top);
        pos.width = Math.round(pos.width);

        // Work out angle
        if (!xDiff) {
            theta = from.y < to.y ? 90 : 270;
        } else if (!yDiff) {
            theta = from.x < to.x ? 0 : 180;
        } else {
            // Angle calculation taken from Raphaël
            theta = Math.floor((180 + Math.atan2(from.y - to.y, from.x - to.x) * 180 / Math.PI + 360) % 360)-1;
        }
        pos.transform = 'rotate(' + theta + 'deg)';
        pos.reversetransform = 'rotate(-' + theta + 'deg)';
        // These have to come after the transform property to override the left/top
        //  values set by the transform matrix in IE
        pos.left = left;
        pos.top = top;

        // Add calculated properties for later manipulation
        pos.extra = {
            center: {
                x: halfX,
                y: halfY
            },
            rotation: {
                deg: theta,
                rad: theta % 360 * Math.PI / 180
            }
        };

        // New object so later manipulation outside this function doesn't affect the cache
        return $.extend({}, pos);
    }

    $.line = function (from, to, options) {
        from = checkPoint(from);
        to = checkPoint(to);
        if (!from || !to) {
            return false;
        }

        // Create div element
        var opts = $.extend({}, $.line.defaults, options || {}),
            $elem = opts.elem ? $(opts.elem) : $('<div/>', {
                'class': opts.className,
                'title': opts.title || '',
                'id': options.id
            }).append(options.extraHtml),
            css = {
                position: 'absolute',
                backgroundColor: opts.lineColor,
                width: 1,
                height: opts.lineWidth
            },
            pos,
            calcDims,
            extra,
            returnVal = $elem;

        $elem.css(css);
        // If elem is detached from the DOM, add it to the body
        if ($elem.length && !$elem[0].parentNode) {
            $elem.appendTo('body');
        }

        // Work out position, accounting for element dimensions
        calcDims = {
            w: $elem.outerWidth(),
            h: $elem.outerHeight(),
            l: parseFloat($elem.css('marginLeft')) || 0,
            t: parseFloat($elem.css('marginTop')) || 0
        };
        // Special case for IE7/8, due to the way the Matrix transform origin is applied
        if ($.support.matrixFilter) {
            calcDims.bw = (parseFloat($elem.css('borderLeftWidth')) || 0)
                        + (parseFloat($elem.css('borderRightWidth')) || 0);
            calcDims.bh = (parseFloat($elem.css('borderTopWidth')) || 0)
                        + (parseFloat($elem.css('borderBottomWidth')) || 0);
        }
        pos = calcPosition(from, to, calcDims);
        extra = pos.extra;
        delete pos.extra;

        var     reverse = pos.reversetransform;
        delete pos.reversetransform;

        $elem.css(pos);
        //$elem.children(":first").css({'transform': reverse});

        // Build object if returnValues option is true
        if (opts.returnValues) {
            returnVal = {
                from: from,
                to: to,
                center: extra.center,
                rotation: extra.rotation
            };
        }

        return returnVal;
    };

    $.line.defaults = {
        elem: '',
        className: 'jquery-line',
        lineWidth: 1,
        lineColor: '#000',
        returnValues: false
    };
})(jQuery);
