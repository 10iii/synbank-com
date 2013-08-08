local redis = require "resty.redis"
local cjson = require "cjson"
local red = redis:new()
red:set_timeout(1000) -- 1 sec
local config = ngx.shared.config;
local the_key = ''
-- or connect to a unix domain socket file listened
-- by a redis server:
-- local ok, err = red:connect("unix:/path/to/redis.sock")

local ok, err = red:connect("127.0.0.1", 6379)
if not ok then
	local resp = {api = "error",desc = "failed to connect",body = err}
	ngx.say(cjson.encode(resp))
	return
end

ok, err = red:select(config:get('redisdb'))
if not ok then
	local resp = {api = "error",desc = "failed to select db",body = err}
	ngx.say(cjson.encode(resp))
	return
end

if ngx.var.cur == 'usd' then
	the_key = config:get('usd_index_current_key')
elseif ngx.var.cur == 'cny' then
	the_key = config:get('cny_index_current_key')
else
	local resp = {api = "error",desc = "illegal currency code"}
	ngx.say(cjson.encode(resp))
	return
end

local res, err = red:get(the_key)
if not res then
	local resp = {api = "error",desc = "failed to get the key",body = err}
	ngx.say(cjson.encode(resp))
	return
end

if res == ngx.null then
	local resp = {api = "error",desc = "the key not found"}
	ngx.say(cjson.encode(resp))
	return
end
local resp = {api = "index",cur = ngx.var.cur,body = res}
ngx.say(cjson.encode(resp))

