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
  s.resources      = 'twilio-product-config.json'

  s.prepare_command = <<-CMD
ruby <<-'RUBY'
require 'json'

pkg = JSON.parse(File.read(File.join(__dir__, 'package.json')))

config_path = File.join(__dir__, 'twilio-product-config.json')
default_name = "react-native"
product_name = default_name

begin
  if File.exist?(config_path)
    existing = JSON.parse(File.read(config_path))
    product_name = existing["productName"] if existing["productName"]
  end
rescue
  product_name = default_name
end

data = {
  "productName" => product_name,
  "productVersion" => pkg["version"]
}

File.write(config_path, JSON.pretty_generate(data) + "\n")
RUBY
  CMD

  s.dependency 'React'
  s.dependency 'TwilioVideo', '~> 5.11.0'
end
