local redis = require "resty.redis"
local cjson = require "cjson"
local red = redis:new()
red:set_timeout(1000) -- 1 sec
local config = ngx.shared.config;
-- or connect to a unix domain socket file listened
-- by a redis server:
--     local ok, err = red:connect("unix:/path/to/redis.sock")

local ok, err = red:connect("127.0.0.1", 6379)
if not ok then
	ngx.say("failed to connect: ", err)
	return
end

ok, err = red:select(3)
if not ok then
	ngx.say("failed to select 3: ", err)
	return
end

ngx.say("select 3: ", ok)

local res, err = red:get(config:get('usd_index_current_key'))
if not res then
	ngx.say("failed to get dog: ", err)
	return
end

if res == ngx.null then
	ngx.say("dog not found.")
	return
end
local resp = {api = "usdindex",body = res}
ngx.say(ngx.var.cur,config:get('redisdb'), cjson.encode(resp))

