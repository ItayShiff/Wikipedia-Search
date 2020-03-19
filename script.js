let myApp = angular.module('myApp', ['ngSanitize', 'ngAnimate'])
			/*
			.config(function($sceProvider) {
			  // Completely disable SCE.  For demonstration purposes only!
			  // Do not use in new projects or libraries.
			  $sceProvider.enabled(false);
			})
			*/
			.directive('autocomplete', [function() {
				return {
					restrict: 'E',
					scope: {
						titles: '=',
						srcs: '=',
						func: '='
					},
					template: ['<div id="suggestions">',
							`<ul ng-repeat="title in titles track by $index" ng-class="{'last-suggestion': $last}">`,
							`<li ng-click="func(title)"><strong>{{title}}</strong> <span ng-hide="srcs[$index]=='nothing'">- {{srcs[$index]}}</span></li>`,
							'</ul>',
							'</div>'].join('')
					
				};
			}])

			.controller('Wikipedia', ['$scope', '$http', '$sce', '$timeout', function($scope, $http, $sce, $timeout){
				$scope.message = "Let's Get <span>Wikipedia</span> Search!";
				$scope.numLimit = 5;
				$scope.search = (searchWiki) => MakeSearch(searchWiki);

				window.addEventListener('load', (event) => {
				    document.getElementById('suggestions').style.left = document.getElementById('alert1').style.left = myForm.search.getBoundingClientRect().left + 'px';
				    document.getElementById('suggestions').style.width = myForm.search.clientWidth -14 + 'px';
					document.getElementById('alert2').style.left = myForm.nums.previousSibling.previousSibling.getBoundingClientRect().left + 'px';					
				});

				

				$scope.numberSearches = 0;

				$scope.isSuggestions = false;
					
				// Handle search used in case of suggestions / auto complete
				$scope.handleSearch = (searchWiki) => {
					if (event.key == "Enter" && myForm.search.value != "") {
						MakeSearch(myForm.search.value)
						return;	
					} else {
					let titles = [];
					let descs = [];
					// timeout because it takes a while for javascript to realize what's the value in input
					$timeout(() => {
							if (myForm.search.value == "") {
								return; // Used to avoid an error of missing value
							}
							// To generate auto complete suggestions according to the entered info in input
							$http.jsonp($sce.trustAsResourceUrl(`https://${langs.value}.wikipedia.org/w/api.php?action=query&utf8=&generator=prefixsearch&gpssearch=${myForm.search.value}&gpslimit=5&prop=pageterms&wbptterms=description&format=json`)).then(function (response) {
								if (response.data.query==undefined) {
									$scope.suggestions = {};
									$scope.isSuggestions = false;
									return;
								}
							let suggestions = response.data.query.pages;
							titles = [];
							desc = [];
							
							angular.forEach(suggestions, function(value, key) {
								titles.push(value.title);
								if (value.terms==undefined) descs.push("nothing");
								else {
									 descs.push(value.terms.description[0]);
								}
								

							});
							$scope.suggestions = {};
							$scope.suggestions.title = titles;
							$scope.suggestions.desc = descs;

							$scope.isSuggestions = true;
						});
						}, 150);
					}
					
				}
				
				
				// Make regular search, limited by the user's pick
				function MakeSearch(searchWiki) {
					$scope.isSuggestions = false;

					
					myForm.search.blur();
					wasClicked = 0;
					if (myForm.search.value.length == 0) {
						alert("You must enter something to search")
						return;
					}
					if (myForm.nums.value > 25 || myForm.nums.value < 1) {
						alert("You didn't enter a valid number")
						return;
					}
					// Responsive note to change the top value of First line after search
					if (innerWidth < 665) {
						SecondLine.previousSibling.previousSibling.children[0].style.top = '35px';
						wikipic.style.left = '-150px';
						wikipic.style.bottom = '100px';
						wikipic.style.width = '150px';
						wikipic.style.marginBottom = '35px';
					}
					$scope.results = [];

					$scope.numberSearches++;
					if ($scope.numberSearches==1) {
						let changingValue = 25;
						let now = Date.now();
						let animation = setInterval(() => {
							document.getElementById('form').style.top = `${changingValue}vh`;
							changingValue--;
							if (document.getElementById('form').style.top=='0vh') {
								clearInterval(animation);
								content.hidden = false;
							}
						}, 15);			
					}
					form.style.paddingTop = '5vh';
					if (window.innerWidth<665) form.style.paddingTop = '10vh';

					let srcs = [];
					let infos = [];
					$scope.counter = 0;

					console.log(myForm.search.value);
					if (credit.classList.contains('creditFade')) credit.classList.toggle('creditFade');
					credit.hidden = true;

					$http.jsonp($sce.trustAsResourceUrl(`https://${langs.value}.wikipedia.org/w/api.php?action=query&list=search&utf8=&format=json&srlimit=${$scope.numLimit}&srsearch=${searchWiki}`)).then(function (response) {
						$scope.results = response.data.query.search;

						if ($scope.results.length == 0) {
							$scope.nothingFound = true;
						} else {
							$scope.nothingFound = false;
						}

						if ($scope.results.length < myForm.nums.value && $scope.results.length > 1) {
							alert("I'm sorry, only " + $scope.results.length + " results were found.")
						}
						if ($scope.results.length < myForm.nums.value && $scope.results.length == 1) {
							alert("I'm sorry, only " + $scope.results.length + " result was found.")
						}

					    let index = 0;
					    if ($scope.results.length) {
					        next();
					    }

						// This function is used to make sure the next AJAX call will be as fast as the first AJAX, which means it's sequential as required 
					    function next() {
					        let result = $scope.results[index];
							// AJAX call to get pictures for any result found (going through each result.title found to find picture) 
							$http.jsonp($sce.trustAsResourceUrl(`https://${langs.value}.wikipedia.org/w/api.php?action=query&titles=${result.title}&prop=pageimages&format=json&pithumbsize=1500`)).then(function (response) {
							let picture = response.data;

							let weirdNumber = Object.keys(picture.query.pages)[0];

							if (picture.query.pages[weirdNumber].thumbnail == undefined) srcs.push('imgs/noimage.png');
							else {
								srcs.push(picture.query.pages[weirdNumber].thumbnail.source);
							}

							if (picture.query.pages[weirdNumber].pageimage==undefined) infos.push(" ");
							else {
								// This is used to get information about the generated picture
								let entry = picture.query.pages[weirdNumber].pageimage;
								entry = entry.replace(/\_/g, " ");
								entry = entry.slice(0, entry.search(/\./));
								infos.push(entry);
					            
							}
							 if (++index < $scope.results.length) {
					                next();
					            }
					            // The first parameter means if it's the end of the array, so finished. The second paramter only happens if only 1 result was found
					         if (index == $scope.results.length-1 || index == $scope.results.length) {
					         	console.log('now');	         	
					         	$scope.results.info = infos;
					         	$scope.results.src = srcs;
					         	
								
					         	// Make sure when all the images are loaded, until then show animation of "loading"
					         	let imgs = document.querySelectorAll('img.allPics');
	         					for (let img of imgs) {
	         						img.onload = function() {
	         							$scope.counter++;
	         							if ($scope.counter == $scope.results.length) $scope.$digest();
	         						};

	         					}   
	     						
	     						// To fix the credit positioning
								if (content.offsetHeight+myForm.offsetHeight + innerHeight/8 > innerHeight) {
										document.querySelector('main').style.position = 'relative';
										document.getElementById('credit').style.bottom = '-37px';
								} else {
										document.querySelector('main').style.position = 'static';
										document.getElementById('credit').style.bottom = '5px';
										credit.classList.add("creditFade");
								}
								credit.hidden = false;

					         	// To fix the elmenents poisition because after search everything is moved, 70ms is just time known for sure they'll be poisitioned correctly
					         	setTimeout(() => {
					         		$scope.isSuggestions = false;
					         		document.getElementById('suggestions').style.left = document.getElementById('alert1').style.left = myForm.search.getBoundingClientRect().left + 'px'; 
					         		document.getElementById('suggestions').style.width = myForm.search.clientWidth-14 + 'px'; // 14 because it's the padding of the search box
									document.getElementById('alert2').style.left = myForm.nums.previousSibling.previousSibling.getBoundingClientRect().left + 'px';


					         	}, 70);
					         }

							});
						}

					});	

				}
				
				// To get more information
				$scope.more = function(title, $index) {
					let key = encodeURI(title);
					$http.jsonp($sce.trustAsResourceUrl(`https://${langs.value}.wikipedia.org/w/api.php?action=query&prop=extracts&format=json&exintro=&titles=${key}`)).then(function (response) {
						let fullText = response.data;
						let weirdNumber = Object.keys(response.data.query.pages)[0];
						let allText = fullText.query.pages[weirdNumber].extract;
						
						if (allText!="") {
							let moreButton = "moreButton" + $index;
							document.getElementById(moreButton).hidden = true;
							let elem = "moreInfo" + $index;
							document.getElementById(elem).innerHTML = allText;
							let lessElem = "lessInfo" + $index;
							document.getElementById(lessElem).hidden = true;
							let lessButton = "lessButton" + $index;
							document.getElementById(lessButton).hidden = false;
							// Responsive note
							if (innerWidth<750) {
								document.getElementById(elem).parentNode.style.marginLeft = 0; // Applying style for section 2
								// Applying styles for section 1
								let changeValue = $scope.changeValue;
								if (changeValue == 'he' || changeValue == 'ar' || changeValue == 'fa' || changeValue == 'ur') {		
									document.getElementById(elem).parentNode.previousSibling.previousSibling.style.paddingRight = '15px';
									document.getElementById(elem).parentNode.previousSibling.previousSibling.style.borderBottom = document.getElementById(elem).parentNode.previousSibling.previousSibling.style.borderRight = '3px dashed gray';
								} else {						
									document.getElementById(elem).parentNode.previousSibling.previousSibling.style.float = 'right';	
									document.getElementById(elem).parentNode.previousSibling.previousSibling.style.paddingLeft = '15px';
									document.getElementById(elem).parentNode.previousSibling.previousSibling.style.borderBottom = document.getElementById(elem).parentNode.previousSibling.previousSibling.style.borderLeft = '3px dashed gray';
								}		
							}
						} else {
							let moreButton = "moreButton" + $index;
							document.getElementById(moreButton).innerHTML = `THERE'S NOTHING TO ADD HERE`;

						}
						
					});
				}				

				// To get less information, retrieve "Show More" button
				$scope.less = function(title, $index) {
					let lessButton = "lessButton" + $index;
					document.getElementById(lessButton).hidden = true;
					let elem = "moreInfo" + $index;
					document.getElementById(elem).innerHTML = "";
					let lessElem = "lessInfo" + $index;
					document.getElementById(lessElem).hidden = false;
					let moreButton = "moreButton" + $index;
					document.getElementById(moreButton).hidden = false;
					// Responsive note
					if (innerWidth<750) {
								document.getElementById(elem).parentNode.style.marginLeft = '230px';
								let changeValue = $scope.changeValue;
								if (changeValue == 'he' || changeValue == 'ar' || changeValue == 'fa' || changeValue == 'ur') {
										document.getElementById(elem).parentNode.previousSibling.previousSibling.style.paddingRight = '0';
										document.getElementById(elem).parentNode.previousSibling.previousSibling.style.borderBottom = document.getElementById(elem).parentNode.previousSibling.previousSibling.style.borderRight = 'none';
								} else {
										document.getElementById(elem).parentNode.previousSibling.previousSibling.style.float = 'left';
										document.getElementById(elem).parentNode.previousSibling.previousSibling.style.paddingLeft = '0';
										document.getElementById(elem).parentNode.previousSibling.previousSibling.style.borderBottom = document.getElementById(elem).parentNode.previousSibling.previousSibling.style.borderLeft = 'none';
								}
													

					}
				}
				// Redirect to Wiki site
				$scope.moveToSite = function(x) {
						$http.jsonp($sce.trustAsResourceUrl(`https://${langs.value}.wikipedia.org/w/api.php?action=opensearch&search=${x}&list=search&limit=1&format=json`)).then(function (response) {
						let siteURL = response.data;
						window.open((siteURL[3][0]), '_blank');
					});
				};
				let wasClicked = 0; // if 1 so that means a suggestion was chosen
				// Clicking on suggestion will make the search
				$scope.searchBySuggestion = (title) => {
					console.log(wasClicked);
					wasClicked = 1;
					myForm.search.value = title;
					$scope.searchWiki = title;	
					$scope.isSuggestions = false;
					MakeSearch(title);
				}

				$scope.blurForSearch = () => {
					// The timeout is used to make JS calcaluate the true value of wasClicked, as in case clicking on suggestion it takes time to change wasClicked to 1 (100ms)
					$timeout(() =>  {
						if (wasClicked==0) { // If there's just blur, not click on suggestion
						$scope.focusSearch = false;
						}
						if (wasClicked == 1) { // If wasn't clicked on suggestion so just blur our = hide suggestions
						$scope.focusSearch = false;
						$scope.isSuggestions = false;
						wasClicked = 0;
					}
				}, 100);
				};

				$scope.changeValue = 'en'; // Initial language value
				$scope.ChangeAlign = function(changeValue) {
					if ($scope.numberSearches>=1) MakeSearch(myForm.search.value);
					if (changeValue == 'he' || changeValue == 'ar' || changeValue == 'fa' || changeValue == 'ur') { // For right to left langauges
						myForm.search.style.textAlign = document.getElementById('suggestions').style.textAlign = content.style.textAlign ="right";
						myForm.search.style.direction = suggestions.style.direction = content.style.direction = 'rtl'; // Changing direction of cursor in text from right to left
						document.body.style.fontFamily = myForm.search.style.fontFamily = 'Arial';
					} else {
						myForm.search.style.textAlign = document.getElementById('suggestions').style.textAlign = content.style.textAlign = "left";
						myForm.search.style.direction = suggestions.style.direction =  content.style.direction = 'ltr'; // Changing direction of cursor in text from left to right
						document.body.style.fontFamily = myForm.search.style.fontFamily = 'Roboto';
					}
				}
				
				
				var timer;
				window.onscroll = () => {
				    if (timer) {
				        window.clearTimeout(timer);
				    }
				    timer = window.setTimeout(function() {
				       // actual code here. Your call back function.
				    console.log(window.pageYOffset>innerHeight/12)
				    }, 100);
				};

			}]);
