<?php
// Change these configuration options if needed
include 'jira-form-proxy-config.php';

function exceptions_error_handler($severity, $message, $filename, $lineno) {
  if (error_reporting() == 0) {
    return;
  }
  if (error_reporting() & $severity) {
    throw new ErrorException($message, 0, $severity, $filename, $lineno);
  }
}
set_error_handler('exceptions_error_handler');
error_reporting(E_ALL ^ E_STRICT);
ini_set('display_errors', 0);

register_shutdown_function(function() {
    $error = error_get_last();
    if ($error['type'] == E_ERROR) {
        header('HTTP/1.1 500 Internal Server Error');
    }
});

// If someone GETs this file, return an error message
if ($_SERVER['REQUEST_METHOD'] != 'POST') {
    echo "JIRA issue creator backend proxy script";
    return;
}

$rand = rand ( 10000 , 99999 );
$date = new DateTime();
$requestOrigin = array_key_exists('HTTP_REFERER', $_SERVER) ? $_SERVER['HTTP_REFERER'] : 'unknownOrigin';
preg_match('~https?://(.*)/.*~i', $requestOrigin, $m );
$sanitizedOrigin = count($m) >= 2 ? str_replace('.', '-', $m[1]) : 'unknownOrigin';
$sanitizedOrigin = str_replace('/', '-slash-', $sanitizedOrigin);
$filename = $log_file_directory . $sanitizedOrigin . '-' . $date->format('Y-m-d-H-i-s') . '-' . $rand . '.txt';
$logged = file_put_contents($filename, file_get_contents('php://input'), FILE_APPEND | LOCK_EX);

if (!function_exists('http_response_code')) {
    function http_response_code($code = NULL) {
        if ($code !== NULL) {

            switch ($code) {
                case 100: $text = 'Continue'; break;
                case 101: $text = 'Switching Protocols'; break;
                case 200: $text = 'OK'; break;
                case 201: $text = 'Created'; break;
                case 202: $text = 'Accepted'; break;
                case 203: $text = 'Non-Authoritative Information'; break;
                case 204: $text = 'No Content'; break;
                case 205: $text = 'Reset Content'; break;
                case 206: $text = 'Partial Content'; break;
                case 300: $text = 'Multiple Choices'; break;
                case 301: $text = 'Moved Permanently'; break;
                case 302: $text = 'Moved Temporarily'; break;
                case 303: $text = 'See Other'; break;
                case 304: $text = 'Not Modified'; break;
                case 305: $text = 'Use Proxy'; break;
                case 400: $text = 'Bad Request'; break;
                case 401: $text = 'Unauthorized'; break;
                case 402: $text = 'Payment Required'; break;
                case 403: $text = 'Forbidden'; break;
                case 404: $text = 'Not Found'; break;
                case 405: $text = 'Method Not Allowed'; break;
                case 406: $text = 'Not Acceptable'; break;
                case 407: $text = 'Proxy Authentication Required'; break;
                case 408: $text = 'Request Time-out'; break;
                case 409: $text = 'Conflict'; break;
                case 410: $text = 'Gone'; break;
                case 411: $text = 'Length Required'; break;
                case 412: $text = 'Precondition Failed'; break;
                case 413: $text = 'Request Entity Too Large'; break;
                case 414: $text = 'Request-URI Too Large'; break;
                case 415: $text = 'Unsupported Media Type'; break;
                case 500: $text = 'Internal Server Error'; break;
                case 501: $text = 'Not Implemented'; break;
                case 502: $text = 'Bad Gateway'; break;
                case 503: $text = 'Service Unavailable'; break;
                case 504: $text = 'Gateway Time-out'; break;
                case 505: $text = 'HTTP Version not supported'; break;
                default:
                    exit('Unknown http status code "' . htmlentities($code) . '"');
                break;
            }

            $protocol = (isset($_SERVER['SERVER_PROTOCOL']) ? $_SERVER['SERVER_PROTOCOL'] : 'HTTP/1.0');
            header($protocol . ' ' . $code . ' ' . $text);
            $GLOBALS['http_response_code'] = $code;
        } else {
            $code = (isset($GLOBALS['http_response_code']) ? $GLOBALS['http_response_code'] : 200);
        }
        return $code;
    }
}
if (!function_exists('getallheaders')) {
    function getallheaders() {
        foreach ($_SERVER as $name => $value) {
           if (substr($name, 0, 5) == 'HTTP_')
           {
               $name = str_replace(' ', '-', ucwords(strtolower(str_replace('_', ' ', substr($name, 5)))));
               $headers[$name] = $value;
           } else if ($name == "CONTENT_TYPE") {
               $headers["Content-Type"] = $value;
           } else if ($name == "CONTENT_LENGTH") {
               $headers["Content-Length"] = $value;
           }
       }
       return $headers;
    }
}

$url = isset($_GET['url']) ? $_GET['url'] : null;

if ( !$url ) {
    $contents = 'ERROR: url not specified';
    $status = array( 'http_code' => 403 );
} else if ( !preg_match( $valid_url_regex, $url ) ) {
    $contents = 'ERROR: invalid url \"' . $url . '\"';
    $status = array( 'http_code' => 403 );
} else if (!$logged) {
    $contents = 'Unable to log to provided directory';
    $status = array( 'http_code' => 500 );
} else {
    $ch = curl_init();
    curl_setopt_array($ch, array(
		CURLOPT_POST => 1,
		CURLOPT_URL => $url,
		CURLOPT_POSTFIELDS => file_get_contents('php://input'),
		CURLOPT_RETURNTRANSFER => true,
        CURLOPT_ENCODING => "gzip"
    ));
    $headers = array();
    curl_setopt( $ch, CURLOPT_HTTPHEADER, array('Content-type: application/json'));
	$contents = curl_exec($ch);
    $status = curl_getinfo($ch);
	curl_close($ch);
}
http_response_code($status['http_code']);
print $contents;
?>
