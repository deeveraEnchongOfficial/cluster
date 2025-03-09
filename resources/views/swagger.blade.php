<!DOCTYPE html>
<html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta http-equiv="X-UA-Compatible" content="IE=edge">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>API Specification</title>
    </head>
    <body>
        <div id="swagger-api"></div>

        @php
            $manifestPath = public_path('build/manifest.json');
            if (file_exists($manifestPath)) {
                $manifest = json_decode(file_get_contents($manifestPath), true);
                $swaggerJs = $manifest['resources/js/swagger.js']['file'] ?? null;
                $swaggerCss = $manifest['resources/js/swagger.js']['css'][0] ?? null;
            }
        @endphp

        @if(isset($swaggerCss))
            <link rel="stylesheet" href="{{ asset('build/' . $swaggerCss) }}">
        @endif

        @if(isset($swaggerJs))
            <script src="{{ asset('build/' . $swaggerJs) }}" defer></script>
        @else
            <script>
                console.error('Swagger.js file not found in manifest.json');
            </script>
        @endif
    </body>
</html>
