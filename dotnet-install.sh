#!/usr/bin/env bash
# Copyright (c) .NET Foundation and contributors. All rights reserved.
# Licensed under the MIT license. See LICENSE file in the project root for full license information.
#

# Stop script on NZEC
set -e
# Stop script if unbound variable found (use ${var:-} if intentional)
set -u
# By default cmd1 | cmd2 returns exit code of cmd2 regardless of cmd1 success
# This is causing it to fail
set -o pipefail

# Use in the the functions: eval $invocation
invocation='say_verbose "Calling: ${yellow:-}${FUNCNAME[0]} ${green:-}$*${normal:-}"'

# standard output may be used as a return value in the functions
# we need a way to write text on the screen in the functions so that
# it won't interfere with the return value.
# Exposing stream 3 as a pipe to standard output of the script itself
exec 3>&1

# Setup some colors to use. These need to work in fairly limited shells, like the Ubuntu Docker container where there are only 8 colors.
# See if stdout is a terminal
if [ -t 1 ] && command -v tput > /dev/null; then
    # see if it supports colors
    ncolors=$(tput colors || echo 0)
    if [ -n "$ncolors" ] && [ $ncolors -ge 8 ]; then
        bold="$(tput bold       || echo)"
        normal="$(tput sgr0     || echo)"
        black="$(tput setaf 0   || echo)"
        red="$(tput setaf 1     || echo)"
        green="$(tput setaf 2     || echo)"
        yellow="$(tput setaf 3  || echo)"
        blue="$(tput setaf 4    || echo)"
        magenta="$(tput setaf 5 || echo)"
        cyan="$(tput setaf 6    || echo)"
        white="$(tput setaf 7   || echo)"
    fi
fi

say_warning() {
    printf "%b\n" "${yellow:-}dotnet_install: Warning: $1${normal:-}" >&3
}

say_err() {
    printf "%b\n" "${red:-}dotnet_install: Error: $1${normal:-}" >&2
}

say() {
    # using stream 3 (defined in the beginning) to not interfere with stdout of functions
    # which may be used as return value
    printf "%b\n" "${cyan:-}dotnet-install:${normal:-} $1" >&3
}

say_verbose() {
    if [ "$verbose" = true ]; then
        say "$1"
    fi
}

# This platform list is finite - if the SDK/Runtime has supported Linux distribution-specific assets,
#   then and only then should the Linux distribution appear in this list.
# Adding a Linux distribution to this list does not imply distribution-specific support.
get_legacy_os_name_from_platform() {
    eval $invocation

    platform="$1"
    case "$platform" in
        "centos.7")
            echo "centos"
            return 0
            ;;
        "debian.8")
            echo "debian"
            return 0
            ;;
        "debian.9")
            echo "debian.9"
            return 0
            ;;
        "fedora.23")
            echo "fedora.23"
            return 0
            ;;
        "fedora.24")
            echo "fedora.24"
            return 0
            ;;
        "fedora.27")
            echo "fedora.27"
            return 0
            ;;
        "fedora.28")
            echo "federa.28"
            return 0
            ;;
        "opensuse.13.2")
            echo "opensuse.13.2"
            return 0
            ;;
        "opensuse.42.1")
            echo "opensuse.42.1"
            return 0
            ;;
        "opensuse.42.3")
            echo "opensuse.42.3"
            return 0
            ;;
        "rhel.7"*)
            echo "rhel"
            return 0
            ;;
        "ubuntu.14.04")
            echo "ubuntu"
            return 0
            ;;
        "ubuntu.16.04")
            echo "ubuntu.16.04"
            return 0
            ;;
        "ubuntu.16.10")
            echo "ubuntu.16.10"
            return 0
            ;;
        "ubuntu.18.04")
            echo "ubuntu.18.04"
            return 0
            ;;
        "alpine.3.4.3")
            echo "alpine"
            return 0
            ;;
    esac
    return 1
}

get_legacy_os_name() {
    eval $invocation

    local uname=$(uname)
    if [ "$uname" = "Darwin" ]; then
        echo "osx"
        return 0
    elif [ -n "$runtime_id" ]; then
        echo $(get_legacy_os_name_from_platform "${runtime_id%-*}" || echo "${runtime_id%-*}")
        return 0
    else
        if [ -e /etc/os-release ]; then
            . /etc/os-release
            os=$(get_legacy_os_name_from_platform "$ID${VERSION_ID:+.${VERSION_ID}}" || echo "")
            if [ -n "$os" ]; then
                echo "$os"
                return 0
            fi
        fi
    fi

    say_verbose "Distribution specific OS name and version could not be detected: UName = $uname"
    return 1
}

get_linux_platform_name() {
    eval $invocation

    if [ -n "$runtime_id" ]; then
        echo "${runtime_id%-*}"
        return 0
    else
        if [ -e /etc/os-release ]; then
            . /etc/os-release
            echo "$ID${VERSION_ID:+.${VERSION_ID}}"
            return 0
        elif [ -e /etc/redhat-release ]; then
            local redhatRelease=$(</etc/redhat-release)
            if [[ $redhatRelease == "CentOS release 6."* || $redhatRelease == "Red Hat Enterprise Linux "*" release 6."* ]]; then
                echo "rhel.6"
                return 0
            fi
        fi
    fi

    say_verbose "Linux specific platform name and version could not be detected: UName = $uname"
    return 1
}

is_musl_based_distro() {
    (ldd --version 2>&1 || true) | grep -q musl
}

get_current_os_name() {
    eval $invocation

    local uname=$(uname)
    if [ "$uname" = "Darwin" ]; then
        echo "osx"
        return 0
    elif [ "$uname" = "FreeBSD" ]; then
        echo "freebsd"
        return 0
    elif [ "$uname" = "Linux" ]; then
        local linux_platform_name=""
        linux_platform_name="$(get_linux_platform_name)" || true

        if [ "$linux_platform_name" = "rhel.6" ]; then
            echo $linux_platform_name
            return 0
        elif is_musl_based_distro; then
            echo "linux-musl"
            return 0
        elif [ "$linux_platform_name" = "linux-musl" ]; then
            echo "linux-musl"
            return 0
        else
            echo "linux"
            return 0
        fi
    fi

    say_err "OS name could not be detected: UName = $uname"
    return 1
}

machine_has() {
    eval $invocation

    command -v "$1" > /dev/null 2>&1
    return $?
}

check_min_reqs() {
    local hasMinimum=false
    if machine_has "curl"; then
        hasMinimum=true
    elif machine_has "wget"; then
        hasMinimum=true
    fi

    if [ "$hasMinimum" = "false" ]; then
        say_err "curl (recommended) or wget are required to download dotnet. Install missing prerequisite to proceed."
        return 1
    fi
    return 0
}

# args:
# input - $1
to_lowercase() {
    #eval $invocation

    echo "$1" | tr '[:upper:]' '[:lower:]'
    return 0
}

# args:
# input - $1
remove_trailing_slash() {
    #eval $invocation

    local input="${1:-}"
    echo "${input%/}"
    return 0
}

# args:
# input - $1
remove_beginning_slash() {
    #eval $invocation

    local input="${1:-}"
    echo "${input#/}"
    return 0
}

# args:
# root_path - $1
# child_path - $2 - this parameter can be empty
combine_paths() {
    eval $invocation

    # TODO: Consider making it work with any number of paths. For now:
    if [ ! -z "${3:-}" ]; then
        say_err "combine_paths: Function takes two parameters."
        return 1
    fi

    local root_path="$(remove_trailing_slash "$1")"
    local child_path="$(remove_beginning_slash "${2:-}")"
    say_verbose "combine_paths: root_path=$root_path"
    say_verbose "combine_paths: child_path=$child_path"
    echo "$root_path/$child_path"
    return 0
}

get_machine_architecture() {
    eval $invocation

    if command -v uname > /dev/null; then
        CPUName=$(uname -m)
        case $CPUName in
        armv1*|armv2*|armv3*|armv4*|armv5*|armv6*)
            echo "armv6-or-below"
            return 0
            ;;
        armv*l)
            echo "arm"
            return 0
            ;;
        aarch64|arm64)
            if [ "$(getconf LONG_BIT)" -lt 64 ]; then
                # This is 32-bit OS running on 64-bit CPU (for example Raspberry Pi OS)
                echo "arm"
                return 0
            fi
            echo "arm64"
            return 0
            ;;
        s390x)
            echo "s390x"
            return 0
            ;;
        ppc64le)
            echo "ppc64le"
            return 0
            ;;
        loongarch64)
            echo "loongarch64"
            return 0
            ;;
        riscv64)
            echo "riscv64"
            return 0
            ;;
        powerpc|ppc)
            echo "ppc"
            return 0
            ;;
        esac
    fi

    # Always default to 'x64'
    echo "x64"
    return 0
}

# args:
# architecture - $1
get_normalized_architecture_from_architecture() {
    eval $invocation

    local architecture="$(to_lowercase "$1")"

    if [[ $architecture == auto ]]; then
        machine_architecture="$(get_machine_architecture)"
        if [[ "$machine_architecture" == "armv6-or-below" ]]; then
            say_err "Architecture `$machine_architecture` not supported. If you think this is a bug, report it at https://github.com/dotnet/install-scripts/issues"
            return 1
        fi

        echo $machine_architecture
        return 0
    fi

    case "$architecture" in
        amd64|x64)
            echo "x64"
            return 0
            ;;
        arm)
            echo "arm"
            return 0
            ;;
        arm64)
            echo "arm64"
            return 0
            ;;
        s390x)
            echo "s390x"
            return 0
            ;;
        ppc64le)
            echo "ppc64le"
            return 0
            ;;
        loongarch64)
            echo "loongarch64"
            return 0
            ;;
        *)
            say_err "Architecture `$architecture` not supported. If you think this is a bug, report it at https://github.com/dotnet/install-scripts/issues"
            return 1
            ;;
    esac
}

# args:
# version - $1
# channel - $2
# architecture - $3
get_normalized_architecture_for_specific_sdk_version() {
    eval $invocation

    local is_version_support_arm64="$(is_arm64_supported "$1")"
    local is_channel_support_arm64="$(is_arm64_supported "$2")"
    local architecture="$3";
    local osname="$(get_current_os_name)"

    if [ "$osname" == "osx" ] && [ "$architecture" == "arm64" ] && { [ "$is_version_support_arm64" = false ] || [ "$is_channel_support_arm64" = false ]; }; then
        #check if rosetta is installed
        if [ "$(/usr/bin/pgrep oahd >/dev/null 2>&1;echo $?)" -eq 0 ]; then
            say_verbose "Changing user architecture from '$architecture' to 'x64' because .NET SDKs prior to version 6.0 do not support arm64."
            echo "x64"
            return 0;
        else
            say_err "Architecture `$architecture` is not supported for .NET SDK version `$version`. Please install Rosetta to allow emulation of the `$architecture` .NET SDK on this platform"
            return 1
        fi
    fi

    echo "$architecture"
    return 0
}

# args:
# version or channel - $1
is_arm64_supported() {
    # Extract the major version by splitting on the dot
    major_version="${1%%.*}"

    # Check if the major version is a valid number and less than 6
    case "$major_version" in
        [0-9]*)
            if [ "$major_version" -lt 6 ]; then
                echo false
                return 0
            fi
            ;;
    esac

    echo true
    return 0
}

# args:
# user_defined_os - $1
get_normalized_os() {
    eval $invocation

    local osname="$(to_lowercase "$1")"
    if [ ! -z "$osname" ]; then
        case "$osname" in
            osx | freebsd | rhel.6 | linux-musl | linux)
                echo "$osname"
                return 0
                ;;
            macos)
                osname='osx'
                echo "$osname"
                return 0
                ;;
            *)
                say_err "'$user_defined_os' is not a supported value for --os option, supported values are: osx, macos, linux, linux-musl, freebsd, rhel.6. If you think this is a bug, report it at https://github.com/dotnet/install-scripts/issues."
                return 1
                ;;
        esac
    else
        osname="$(get_current_os_name)" || return 1
    fi
    echo "$osname"
    return 0
}

# args:
# quality - $1
get_normalized_quality() {
    eval $invocation

    local quality="$(to_lowercase "$1")"
    if [ ! -z "$quality" ]; then
        case "$quality" in
            daily | preview)
                echo "$quality"
                return 0
                ;;
            ga)
                #ga quality is available without specifying quality, so normalizing it to empty
                return 0
                ;;
            *)
                say_err "'$quality' is not a supported value for --quality option. Supported values are: daily, preview, ga. If you think this is a bug, report it at https://github.com/dotnet/install-scripts/issues."
                return 1
                ;;
        esac
    fi
    return 0
}

# args:
# channel - $1
get_normalized_channel() {
    eval $invocation

    local channel="$(to_lowercase "$1")"

    if [[ $channel == current ]]; then
        say_warning 'Value "Current" is deprecated for -Channel option. Use "STS" instead.'
    fi

    if [[ $channel == release/* ]]; then
        say_warning 'Using branch name with -Channel option is no longer supported with newer releases. Use -Quality option with a channel in X.Y format instead.';
    fi

    if [ ! -z "$channel" ]; then
        case "$channel" in
            lts)
                echo "LTS"
                return 0
                ;;
            sts)
                echo "STS"
                return 0
                ;;
            current)
                echo "STS"
                return 0
                ;;
            *)
                echo "$channel"
                return 0
                ;;
        esac
    fi

    return 0
}

# args:
# runtime - $1
get_normalized_product() {
    eval $invocation

    local product=""
    local runtime="$(to_lowercase "$1")"
    if [[ "$runtime" == "dotnet" ]]; then
        product="dotnet-runtime"
    elif [[ "$runtime" == "aspnetcore" ]]; then
        product="aspnetcore-runtime"
    elif [ -z "$runtime" ]; then
        product="dotnet-sdk"
    fi
    echo "$product"
    return 0
}

# The version text returned from the feeds is a 1-line or 2-line string:
# For the SDK and the dotnet runtime (2 lines):
# Line 1: # commit_hash
# Line 2: # 4-part version
# For the aspnetcore runtime (1 line):
# Line 1: # 4-part version

# args:
# version_text - stdin
get_version_from_latestversion_file_content() {
    eval $invocation

    cat | tail -n 1 | sed 's/\r$//'
    return 0
}

# args:
# install_root - $1
# relative_path_to_package - $2
# specific_version - $3
is_dotnet_package_installed() {
    eval $invocation

    local install_root="$1"
    local relative_path_to_package="$2"
    local specific_version="${3//[$'\t\r\n']}"

    local dotnet_package_path="$(combine_paths "$(combine_paths "$install_root" "$relative_path_to_package")" "$specific_version")"
    say_verbose "is_dotnet_package_installed: dotnet_package_path=$dotnet_package_path"

    if [ -d "$dotnet_package_path" ]; then
        return 0
    else
        return 1
    fi
}

# args:
# downloaded file - $1
# remote_file_size - $2
validate_remote_local_file_sizes()
{
    eval $invocation

    local downloaded_file="$1"
    local remote_file_size="$2"
    local file_size=''

    if [[ "$OSTYPE" == "linux-gnu"* ]]; then
        file_size="$(stat -c '%s' "$downloaded_file")"
    elif [[ "$OSTYPE" == "darwin"* ]]; then
        # hardcode in order to avoid conflicts with GNU stat
        file_size="$(/usr/bin/stat -f '%z' "$downloaded_file")"
    fi

    if [ -n "$file_size" ]; then
        say "Downloaded file size is $file_size bytes."

        if [ -n "$remote_file_size" ] && [ -n "$file_size" ]; then
            if [ "$remote_file_size" -ne "$file_size" ]; then
                say "The remote and local file sizes are not equal. The remote file size is $remote_file_size bytes and the local size is $file_size bytes. The local package may be corrupted."
            else
                say "The remote and local file sizes are equal."
            fi
        fi

    else
        say "Either downloaded or local package size can not be measured. One of them may be corrupted."
    fi
}

# args:
# azure_feed - $1
# channel - $2
# normalized_architecture - $3
get_version_from_latestversion_file() {
    eval $invocation

    local azure_feed="$1"
    local channel="$2"
    local normalized_architecture="$3"

    local version_file_url=null
    if [[ "$runtime" == "dotnet" ]]; then
        version_file_url="$azure_feed/Runtime/$channel/latest.version"
    elif [[ "$runtime" == "aspnetcore" ]]; then
        version_file_url="$azure_feed/aspnetcore/Runtime/$channel/latest.version"
    elif [ -z "$runtime" ]; then
         version_file_url="$azure_feed/Sdk/$channel/latest.version"
    else
        say_err "Invalid value for \$runtime"
        return 1
    fi
    say_verbose "get_version_from_latestversion_file: latest url: $version_file_url"

    download "$version_file_url" || return $?
    return 0
}

# args:
# json_file - $1
parse_globaljson_file_for_version() {
    eval $invocation

    local json_file="$1"
    if [ ! -f "$json_file" ]; then
        say_err "Unable to find \`$json_file\`"
        return 1
    fi

    sdk_section=$(cat "$json_file" | tr -d "\r" | awk '/"sdk"/,/}/')
    if [ -z "$sdk_section" ]; then
        say_err "Unable to parse the SDK node in \`$json_file\`"
        return 1
    fi

    sdk_list=$(echo "$sdk_section" | awk -F"[{}]" '{print $2}')
    sdk_list=${sdk_list//[\" ]/}
    sdk_list=${sdk_list//,/$'\n'}

    local version_info=""
    while read -r line; do
      IFS=:
      while read -r key value; do
        if [[ "$key" == "version" ]]; then
          version_info=$value
        fi
      done <<< "$line"
    done <<< "$sdk_list"
    if [ -z "$version_info" ]; then
        say_err "Unable to find the SDK:version node in \`$json_file\`"
        return 1
    fi

    echo "$version_info"
    return 0
}

# args:
# download_url - $1
# temp_path - $2
# timeout - $3
download_with_curl() {
    eval $invocation

    local download_url="$1"
    local temp_path="$2"
    local timeout="$3"

    local curl_command="curl -SL --retry 5 --retry-delay 10 --create-dirs -o \"$temp_path\" \"$download_url\""
    if [ -n "$timeout" ]; then
        curl_command+=" --connect-timeout $timeout"
    fi
    say_verbose "curl_command=$curl_command"

    eval "$curl_command" || return 1
    return 0
}

# args:
# download_url - $1
# temp_path - $2
# timeout - $3
download_with_wget() {
    eval $invocation

    local download_url="$1"
    local temp_path="$2"
    local timeout="$3"

    local wget_command="wget -O \"$temp_path\" --tries=5 --wait=10 --timestamping \"$download_url\""
    if [ -n "$timeout" ]; then
        wget_command+=" --timeout $timeout"
    fi
    say_verbose "wget_command=$wget_command"

    eval "$wget_command" || return 1
    return 0
}

# args:
# download_url - $1
# temp_path - $2
# timeout - $3
download_with_powershell() {
    eval $invocation

    local download_url="$1"
    local temp_path="$2"
    local timeout="${3:-30}" # Default timeout is 30 seconds

    local powershell_command="powershell -Command \"\$ProgressPreference='SilentlyContinue'; Invoke-WebRequest -Uri '$download_url' -OutFile '$temp_path' -TimeoutSec $timeout\""
    say_verbose "powershell_command=$powershell_command"

    eval "$powershell_command" || return 1
    return 0
}

# args:
# download_url - $1
# remote_file_size - $2
# timeout - $3
download() {
    eval $invocation

    local download_url="$1"
    local remote_file_size="$2"
    local timeout="$3"
    local temp_path
    temp_path="$(mktemp -t dotnet-install.XXXX)" || return 1

    say_verbose "Downloading: $download_url"
    say_verbose "Destination: $temp_path"

    local download_succeeded=false
    if machine_has "curl"; then
        say "Downloading dotnet via curl"
        if download_with_curl "$download_url" "$temp_path" "$timeout"; then
            download_succeeded=true
        else
            say_warning "Downloading with curl failed, falling back to wget"
        fi
    fi

    if [ "$download_succeeded" = false ] && machine_has "wget"; then
        say "Downloading dotnet via wget"
        if download_with_wget "$download_url" "$temp_path" "$timeout"; then
            download_succeeded=true
        else
            say_warning "Downloading with wget failed"
        fi
    fi

    if [ "$download_succeeded" = false ] && [ "$OSTYPE" == "cygwin" ] || [ "$OSTYPE" == "msys" ]; then
        if machine_has "powershell"; then
            say "Downloading dotnet via powershell"
             if download_with_powershell "$download_url" "$temp_path" "$timeout"; then
                download_succeeded=true
            else
                say_warning "Downloading with powershell failed"
            fi
        fi
    fi

    if [ "$download_succeeded" = false ]; then
        say_err "Download failed."
        return 1
    fi

    validate_remote_local_file_sizes "$temp_path" "$remote_file_size"

    echo "$temp_path"
    return 0
}

# args:
# archive_path - $1
# target_directory - $2
extract_with_tar() {
    eval $invocation

    local archive_path="$1"
    local target_directory="$2"

    say_verbose "Executing: tar -xzf \"$archive_path\" -C \"$target_directory\""
    if ! tar -xzf "$archive_path" -C "$target_directory"; then
        say_err "Failed to extract archive '$archive_path' to '$target_directory' with tar."
        return 1
    fi
    return 0
}

# args:
# archive_path - $1
# target_directory - $2
extract_with_7z() {
    eval $invocation

    local archive_path="$1"
    local target_directory="$2"

    say_verbose "Executing: 7z x \"$archive_path\" -o\"$target_directory\""
    if ! 7z x "$archive_path" -o"$target_directory"; then
        say_err "Failed to extract archive '$archive_path' to '$target_directory' with 7z."
        return 1
    fi
    return 0
}

# args:
# archive_path - $1
# target_directory - $2
extract_with_expand_archive() {
    eval $invocation

    local archive_path="$1"
    local target_directory="$2"

    say_verbose "Executing: powershell -Command \"Expand-Archive -Path '$archive_path' -DestinationPath '$target_directory' -Force\""
    if ! powershell -Command "Expand-Archive -Path '$archive_path' -DestinationPath '$target_directory' -Force"; then
        say_err "Failed to extract archive '$archive_path' to '$target_directory' with Expand-Archive."
        return 1
    fi
    return 0
}

# args:
# archive_path - $1
# target_directory - $2
extract() {
    eval $invocation

    local archive_path="$1"
    local target_directory="$2"

    say "Extracting dotnet to $target_directory"

    local extract_succeeded=false
    if machine_has "tar"; then
        say_verbose "Attempting extraction with tar"
        if extract_with_tar "$archive_path" "$target_directory"; then
            extract_succeeded=true
        else
            say_warning "Extraction with tar failed, falling back to 7z"
        fi
    fi

    if [ "$extract_succeeded" = false ] && machine_has "7z"; then
        say_verbose "Attempting extraction with 7z"
        if extract_with_7z "$archive_path" "$target_directory"; then
            extract_succeeded=true
        else
            say_warning "Extraction with 7z failed"
        fi
    fi

    if [ "$extract_succeeded" = false ] && [ "$OSTYPE" == "cygwin" ] || [ "$OSTYPE" == "msys" ]; then
         if machine_has "powershell"; then
            say_verbose "Attempting extraction with Expand-Archive"
            if extract_with_expand_archive "$archive_path" "$target_directory"; then
                extract_succeeded=true
            else
                say_warning "Extraction with Expand-Archive failed"
            fi
         fi
    fi

    if [ "$extract_succeeded" = false ]; then
        say_err "Extraction failed."
        return 1
    fi

    return 0
}

# args:
# install_dir - $1
# channel - $2
# specific_version - $3
# os_name - $4
# normalized_architecture - $5
# product - $6
# file_extension - $7
get_dotnet_package_url() {
    eval $invocation

    local install_dir="$1"
    local channel="$2"
    local specific_version="$3"
    local os_name="$4"
    local normalized_architecture="$5"
    local product="$6"
    local file_extension="$7"

    local azure_feed="https://dotnetcli.blob.core.windows.net/dotnet"
    local latest_version
    latest_version="$(get_version_from_latestversion_file "$azure_feed" "$channel" "$normalized_architecture")" || return 1

    say_verbose "get_dotnet_package_url: Latest version found: $latest_version"

    local target_version="$latest_version"
    if [ -n "$specific_version" ]; then
        target_version="$specific_version"
        say_verbose "get_dotnet_package_url: Specific version requested: $target_version"
    fi

    local normalized_version=$(echo "$target_version" | sed 's/-preview/-preview./g')
    local major_version=$(echo "$normalized_version" | cut -d'.' -f1)

    if [ "$product" == "dotnet-runtime" ] || [ "$product" == "aspnetcore-runtime" ] || [ "$product" == "dotnet-sdk" ]; then

        local relative_package_path=""
        if [ "$product" == "dotnet-runtime" ]; then
            relative_package_path="Runtime"
        elif [ "$product" == "aspnetcore-runtime" ]; then
            relative_package_path="aspnetcore/Runtime"
        elif [ "$product" == "dotnet-sdk" ]; then
            relative_package_path="Sdk"
        fi

        local dotnet_package_feed="$azure_feed/$relative_package_path/$target_version"

        if [ -n "$os_name" ]; then
             local package_filename="$product-$target_version-$os_name-$normalized_architecture.$file_extension"
             echo "$dotnet_package_feed/$package_filename"
             return 0
        fi

        # fallback to legacy os_name for older versions
        local legacy_os_name="$(get_legacy_os_name)" || true
        if [ -n "$legacy_os_name" ]; then
            local package_filename="$product-$target_version-$legacy_os_name-$normalized_architecture.$file_extension"
            echo "$dotnet_package_feed/$package_filename"
            return 0
        fi
    fi

    say_err "Could not construct download url for product $product, version $target_version, os $os_name, architecture $normalized_architecture"
    return 1
}

# args:
# specific_version - $1
# channel - $2
# normalized_architecture - $3
# install_dir - $4
# product - $5
install_dotnet_package() {
    eval $invocation

    local specific_version="$1"
    local channel="$2"
    local normalized_architecture="$3"
    local install_dir="$4"
    local product="$5"
    local os_name="$6"

    local file_extension="tar.gz"
    if [ "$os_name" == "osx" ]; then
        file_extension="pkg"
    elif [ "$os_name" == "win" ] || [ "$OSTYPE" == "cygwin" ] || [ "$OSTYPE" == "msys" ]; then
        file_extension="zip"
    fi

    local dotnet_package_url
    dotnet_package_url="$(get_dotnet_package_url "$install_dir" "$channel" "$specific_version" "$os_name" "$normalized_architecture" "$product" "$file_extension")" || return 1

    local temp_package_path
    temp_