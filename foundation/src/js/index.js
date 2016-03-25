require(['zepto', 'lazyload', 'FastClick'], function($, lazyload, FastClick) {
	var interface = {
		optional: 'http://fundex2.eastmoney.com/FundMobileApi/FundTradeFavorInformation.ashx?Fcodes=161613,002259,001404,690009,000136,590008,110013,110029,001838,202101,460005,000063,110028,110027&plat=Android&deviceid=54e27467c3b0bd3667be7a362b9fcec4&PageIndex=1&version=4.1.0&PageSize=10000',
			juti: 'http: //fundex2.eastmoney.com/FundMobileApi/FundNetDiagram.ashx?FCODE={$fcode}&appType=ttjj&plat=Android&deviceid=54e27467c3b0bd3667be7a362b9fcec4&RANGE=n&version=4.1.0&product=EFund'
	};
	var zhaiquan = $("#zhaiquan tbody"),
		hunhe = $("#hunhe tbody"),
		zhishu = $("#zhishu tbody"),
		gupiao = $("#gupiao tbody"),
		zf = $("#zf"),
		yutou, //预投净值
		yushou; //预收净值
	$.ajax({
		type: 'GET',
		url: interface.optional,
		dataType: 'json',
		error: function() {
			alert("error tip");
		},
		success: function(rs) {
			var TotalCount = rs.TotalCount,
				data = rs.Datas,
				iHtml = '',
				iTpl = [
					'<tr>',
					'<td>{$shortname}</td>',
					'<td>{$fcode}</td>',
					'<td>{$dwjz}</td>',
					'<td id="zf" class="test">{$zf}</td>',
					'<td>{$ytdwjz}</td>',
					'<td>{$ysdwjz}</td>',
					'</tr>'
				].join("");
			if (!rs && rs.TotalCount) {
				alert("重新刷新一下！");
				return;
			}
			for (var i = 0; i < TotalCount; i++) {
				alert(typeof data[0].RZDF);
				if (data[i].RZDF >= 0) {
					zf.removeClass(".zf-green").addClass(".zf-red");
				} else {
					zf.removeClass("zf-red").addClass(".zf-green");
				}

				iHtml = iTpl.replace('{$shortname}', data[i].SHORTNAME).replace('{$fcode}', data[i].FCODE).replace('{$dwjz}', data[i].DWJZ || '1.0000').replace("{$zf}", data[i].RZDF);
				switch (data[i].FTYPE) {
					case "混合型":
						hunhe.append(iHtml);
						break;
					case "股票型":
						gupiao.append(iHtml);
						break;
					case "债券型":
						zhaiquan.append(iHtml);
						break;
					case "股票指数":
						zhishu.append(iHtml);

				}
			}
		}
	});
});