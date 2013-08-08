-- try openresty easy creat RESTful API srv.
ngx.req.read_body()
local method = ngx.var.request_method
ngx.say("request_method:\t",method)

if method ~= 'POST' then
    ngx.say('pls. /=/chk only work as POST ;-)')
else
    ngx.say('realy working,,,')
end
