require 'json'

package = JSON.parse(File.read(File.join(__dir__, 'package.json')))

Pod::Spec.new do |s|
  s.name           = 'twilio-video-react-native-sdk'
  s.version        = package['version']
  s.summary        = package['description']
  s.license        = package['license']
  s.authors        = package['authors']
  s.homepage       = package['homepage']
  s.source         = { git: 'https://github.com/twilio/react-native-twilio-video-webrtc.git', tag: s.version }

  s.requires_arc   = true
  s.platform       = :ios, '10.0'

  s.preserve_paths = 'LICENSE', 'README.md', 'package.json', 'index.js'
  s.source_files   = 'ios/*.{h,m}'

  s.dependency 'React'
  s.dependency 'TwilioVideo', '~> 5.10.0'
end
