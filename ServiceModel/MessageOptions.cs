using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

namespace ServiceModel
{
    public class MessageOptions
    {
        public MessageRequest request { get; set; }
       
    }
    public class MessageRequest
    {
        public string application { get; set; }
        public string auth { get; set; }
        public Notification notifications { get; set; }
    }
    public class Notification
    {
        public Notification()
        {
            send_date = "now";
            link = "";
            wp_backbackground = "";
            wp_background = "";
            wp_backtitle = "";
            wp_type = "Tile";
            ios_badges = 5;
            ios_sound = "";
            mac_badges = 3;
            mac_sound = "sound.caf";
            android_icon = "";
            android_banner = "";
            android_custom_icon = "";
            platforms = new List<int> {1, 2, 3, 4, 5};


        }
        public string send_date { get; set; }
        public string content { get; set; }
        public string wp_type { get; set; }
        public int page_id { get; set; }
        public string link { get; set; }
        //public DATA data { get; set; }
        public List<int> platforms { get; set; }
        public string wp_background { get; set; }
        public string wp_backbackground { get; set; }
        public string wp_backtitle { get; set; }
        public int wp_count { get; set; }
        public int ios_badges { get; set; }
        public string ios_sound { get; set; }
        public Content ios_root_params { get; set; }
        public int mac_badges { get; set; }
        public string mac_sound { get; set; }
        public Content mac_root_params { get; set; }
        public AndroidParams android_root_params { get; set; }
        public string android_icon { get; set; }
        public string android_custom_icon { get; set; }
        public string android_banner { get; set; }
        public List<string> devices { get; set; }
        public string filter { get; set; }
        public List<Tag> conditions { get; set; }
    }
    //public class DATA
    //{
    //    public object custom { get; set; }
    //}
    public class Content
    {
        public Content()
        {
            content_available = 1;
        }
        public int content_available { get; set; }
    }
    public class AndroidParams
    {
        public string key { get; set; }
    }
}
